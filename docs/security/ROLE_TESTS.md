# Role-Based Security Tests

## Requirements
- API running (default `http://localhost:5158`)
- Environment variables (set in your shell):
  - `API_BASE_URL` (optional)
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  - `USER_EMAIL`, `USER_PASSWORD`
  - `INSTRUCTOR_EMAIL`, `INSTRUCTOR_PASSWORD` (optional)

## Run (Windows PowerShell)
```
powershell -ExecutionPolicy Bypass -File .\scripts\role-tests.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\stress-input-tests.ps1
```

## Run (macOS/Linux)
```
bash ./scripts/role-tests.sh
bash ./scripts/stress-input-tests.sh
```

## Expected
- Guest can access public endpoints only.
- User cannot access admin/instructor endpoints.
- Admin can access admin endpoints.
- Invalid/oversized input returns 400 with ProblemDetails (no 500).
