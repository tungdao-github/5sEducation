$ErrorActionPreference = "Stop"

$ApiBaseUrl = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:5158" }
$WebBaseUrl = if ($env:WEB_BASE_URL) { $env:WEB_BASE_URL } else { "http://localhost:3000" }

function Invoke-Check {
    param(
        [string]$Name,
        [string]$Url,
        [int[]]$ExpectedStatus = @(200)
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing
        $status = [int]$response.StatusCode
        if ($ExpectedStatus -contains $status) {
            Write-Host "[PASS] $Name => $status"
            return
        }

        throw "Unexpected status $status"
    }
    catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode.value__
            if ($ExpectedStatus -contains $status) {
                Write-Host "[PASS] $Name => $status"
                return
            }
            throw "[$Name] expected $($ExpectedStatus -join ', ') but got $status at $Url"
        }

        throw
    }
}

Write-Host "== API smoke =="
Invoke-Check -Name "api_health" -Url "$ApiBaseUrl/health"
Invoke-Check -Name "api_ready" -Url "$ApiBaseUrl/ready"
Invoke-Check -Name "api_categories" -Url "$ApiBaseUrl/api/categories"
Invoke-Check -Name "api_courses" -Url "$ApiBaseUrl/api/courses"
Invoke-Check -Name "api_blog_posts" -Url "$ApiBaseUrl/api/blog/posts"
Invoke-Check -Name "api_stats_summary" -Url "$ApiBaseUrl/api/stats/summary"

Write-Host "`n== Web smoke =="
Invoke-Check -Name "web_home" -Url "$WebBaseUrl/"
Invoke-Check -Name "web_courses" -Url "$WebBaseUrl/courses"
Invoke-Check -Name "web_blog" -Url "$WebBaseUrl/blog"
Invoke-Check -Name "web_login" -Url "$WebBaseUrl/login"
Invoke-Check -Name "web_support" -Url "$WebBaseUrl/support"
Invoke-Check -Name "web_my_learning" -Url "$WebBaseUrl/my-learning"
Invoke-Check -Name "web_admin" -Url "$WebBaseUrl/admin"

Write-Host "`n== Done =="
