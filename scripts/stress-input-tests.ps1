$ErrorActionPreference = "Stop"

$BaseUrl = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:5158" }
$AdminEmail = $env:ADMIN_EMAIL
$AdminPassword = $env:ADMIN_PASSWORD

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Token = $null,
        [string]$Body = $null
    )

    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    try {
        if ($Body) {
            $response = Invoke-WebRequest -Method $Method -Uri $Url -Headers $headers -Body $Body -ContentType "application/json"
        } else {
            $response = Invoke-WebRequest -Method $Method -Uri $Url -Headers $headers
        }

        return @{ status = [int]$response.StatusCode; body = $response.Content }
    } catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode.value__
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
            return @{ status = $status; body = $body }
        }
        throw
    }
}

function Get-Token {
    param([string]$Email, [string]$Password)
    $payload = @{ email = $Email; password = $Password } | ConvertTo-Json
    $result = Invoke-Api -Method "POST" -Url "$BaseUrl/api/auth/login" -Body $payload
    if ($result.status -ne 200) {
        Write-Host "Login failed for $Email (status $($result.status))"
        return $null
    }
    $data = $result.body | ConvertFrom-Json
    return $data.token
}

function Assert-Status {
    param([string]$Name, [int[]]$Expected, [int]$Actual)
    if ($Expected -contains $Actual) {
        Write-Host "[PASS] $Name => $Actual"
    } else {
        Write-Host "[FAIL] $Name => $Actual (expected: $($Expected -join ', '))"
    }
}

Write-Host "== Stress Input Tests =="
Write-Host "Base URL: $BaseUrl"

$longText = ("x" * 5000)

# Support message too long
$supportPayload = @{ name = "Test"; email = "test@example.com"; message = $longText } | ConvertTo-Json
$supportResult = Invoke-Api -Method "POST" -Url "$BaseUrl/api/support/messages" -Body $supportPayload
Assert-Status -Name "support_message_too_long" -Expected @(400) -Actual $supportResult.status

# Invalid register payload
$registerPayload = @{ email = "invalid-email"; password = "123"; firstName = "A"; lastName = "B" } | ConvertTo-Json
$registerResult = Invoke-Api -Method "POST" -Url "$BaseUrl/api/auth/register" -Body $registerPayload
Assert-Status -Name "register_invalid_email_password" -Expected @(400) -Actual $registerResult.status

# Admin blog post oversized fields (if admin creds provided)
if ($AdminEmail -and $AdminPassword) {
    $adminToken = Get-Token -Email $AdminEmail -Password $AdminPassword
    if ($adminToken) {
        $blogPayload = @{
            title = ("t" * 250)
            summary = $longText
            content = "test"
            coverImageUrl = "https://example.com/cover.jpg"
            authorName = ("a" * 200)
            tags = ("tag," * 300)
            locale = "en"
            seoTitle = ("s" * 300)
            seoDescription = ("d" * 2000)
            isPublished = $false
        } | ConvertTo-Json

        $blogResult = Invoke-Api -Method "POST" -Url "$BaseUrl/api/admin/blog/posts" -Token $adminToken -Body $blogPayload
        Assert-Status -Name "admin_blog_oversized_fields" -Expected @(400) -Actual $blogResult.status
    }
} else {
    Write-Host "[SKIP] Admin blog stress (missing ADMIN_EMAIL/ADMIN_PASSWORD)"
}

Write-Host "== Done =="
