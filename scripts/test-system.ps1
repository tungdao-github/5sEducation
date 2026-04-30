$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ApiProject = Join-Path $RepoRoot "apps\api\UdemyClone.Api.csproj"
$WebDir = Join-Path $RepoRoot "apps\web"
$SmokeScript = Join-Path $PSScriptRoot "system-smoke.ps1"
$SmokeDatabaseName = "EducationProjectDB_SystemSmoke_{0}" -f ([Guid]::NewGuid().ToString("N"))
$SqlServerConnectionString = "Server=MYLAPTOP\\SQLEXPRESS;Database=$SmokeDatabaseName;Trusted_Connection=True;TrustServerCertificate=True"
$ApiLogOut = Join-Path $env:TEMP "udemyclone-api-system-smoke.out.log"
$ApiLogErr = Join-Path $env:TEMP "udemyclone-api-system-smoke.err.log"
$WebLogOut = Join-Path $env:TEMP "udemyclone-web-system-smoke.out.log"
$WebLogErr = Join-Path $env:TEMP "udemyclone-web-system-smoke.err.log"

function Wait-Port {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 120
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            if (Test-NetConnection 127.0.0.1 -Port $Port -InformationLevel Quiet) {
                return
            }
        } catch {
        }

        Start-Sleep -Seconds 2
    }

    throw "Port $Port did not open within $TimeoutSeconds seconds."
}

function Stop-SafeProcess {
    param([int]$Id)
    try {
        Stop-Process -Id $Id -Force -ErrorAction SilentlyContinue
    } catch {
    }
}

Write-Host "== Backend tests =="
& dotnet test (Join-Path $RepoRoot "apps\api\tests\UdemyClone.Api.Tests\UdemyClone.Api.Tests.csproj") --logger "console;verbosity=minimal"

Write-Host "`n== Web build =="
Push-Location $WebDir
try {
    & npm run build
}
finally {
    Pop-Location
}

Write-Host "`n== Start local servers =="
$env:ASPNETCORE_URLS = "http://127.0.0.1:5158"
$env:DbProvider = "SqlServer"
$env:ConnectionStrings__SqlServer = $SqlServerConnectionString
$api = Start-Process dotnet -ArgumentList @("run", "--project", $ApiProject) -WorkingDirectory (Split-Path -Parent $ApiProject) -PassThru -RedirectStandardOutput $ApiLogOut -RedirectStandardError $ApiLogErr

$env:ASPNETCORE_URLS = "http://127.0.0.1:3000"
$web = Start-Process npm -ArgumentList @("run", "start") -WorkingDirectory $WebDir -PassThru -RedirectStandardOutput $WebLogOut -RedirectStandardError $WebLogErr

try {
    Write-Host "Waiting for API and Web ports..."
    Wait-Port -Port 5158
    Wait-Port -Port 3000

    Write-Host "`n== System smoke =="
    & powershell -ExecutionPolicy Bypass -File $SmokeScript
}
finally {
    Write-Host "`n== Stop local servers =="
    Stop-SafeProcess -Id $api.Id
    Stop-SafeProcess -Id $web.Id

    try {
        sqlcmd -S "MYLAPTOP\SQLEXPRESS" -Q "IF DB_ID(N'$SmokeDatabaseName') IS NOT NULL BEGIN ALTER DATABASE [$SmokeDatabaseName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$SmokeDatabaseName]; END" -C | Out-Null
    } catch {
    }
}
