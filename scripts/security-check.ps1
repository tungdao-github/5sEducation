Write-Host "== Security Checks (API) =="
Push-Location "C:\Users\TUNG\django-udemy-clone\apps\api"
dotnet --version | Out-Null
dotnet list package --vulnerable
dotnet list package --outdated
Pop-Location

Write-Host "`n== Security Checks (Web) =="
Push-Location "C:\Users\TUNG\django-udemy-clone\apps\web"
npm --version | Out-Null
npm run lint
npm audit --omit=dev
Pop-Location

Write-Host "`n== Done =="
