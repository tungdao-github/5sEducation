$ErrorActionPreference = "Stop"

$BaseUrl = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:5158" }
$AdminEmail = $env:ADMIN_EMAIL
$AdminPassword = $env:ADMIN_PASSWORD
$UserEmail = $env:USER_EMAIL
$UserPassword = $env:USER_PASSWORD
$InstructorEmail = $env:INSTRUCTOR_EMAIL
$InstructorPassword = $env:INSTRUCTOR_PASSWORD

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

Write-Host "== Role Tests =="
Write-Host "Base URL: $BaseUrl"

# Guest tests
$guestAdmin = Invoke-Api -Method "GET" -Url "$BaseUrl/api/admin/users"
Assert-Status -Name "guest_admin_users" -Expected @(401, 403) -Actual $guestAdmin.status

$guestInstructor = Invoke-Api -Method "GET" -Url "$BaseUrl/api/instructor/courses"
Assert-Status -Name "guest_instructor_courses" -Expected @(401, 403) -Actual $guestInstructor.status

# User tests
if ($UserEmail -and $UserPassword) {
    $userToken = Get-Token -Email $UserEmail -Password $UserPassword
    if ($userToken) {
        $userAdmin = Invoke-Api -Method "GET" -Url "$BaseUrl/api/admin/users" -Token $userToken
        Assert-Status -Name "user_admin_users" -Expected @(403) -Actual $userAdmin.status

        $userInstructor = Invoke-Api -Method "GET" -Url "$BaseUrl/api/instructor/courses" -Token $userToken
        Assert-Status -Name "user_instructor_courses" -Expected @(403) -Actual $userInstructor.status
    }
} else {
    Write-Host "[SKIP] User tests (missing USER_EMAIL/USER_PASSWORD)"
}

# Instructor tests
if ($InstructorEmail -and $InstructorPassword) {
    $instructorToken = Get-Token -Email $InstructorEmail -Password $InstructorPassword
    if ($instructorToken) {
        $instructorCourses = Invoke-Api -Method "GET" -Url "$BaseUrl/api/instructor/courses" -Token $instructorToken
        Assert-Status -Name "instructor_instructor_courses" -Expected @(200) -Actual $instructorCourses.status
    }
} else {
    Write-Host "[SKIP] Instructor tests (missing INSTRUCTOR_EMAIL/INSTRUCTOR_PASSWORD)"
}

# Admin tests
if ($AdminEmail -and $AdminPassword) {
    $adminToken = Get-Token -Email $AdminEmail -Password $AdminPassword
    if ($adminToken) {
        $adminUsers = Invoke-Api -Method "GET" -Url "$BaseUrl/api/admin/users" -Token $adminToken
        Assert-Status -Name "admin_admin_users" -Expected @(200) -Actual $adminUsers.status
    }
} else {
    Write-Host "[SKIP] Admin tests (missing ADMIN_EMAIL/ADMIN_PASSWORD)"
}

Write-Host "== Done =="
