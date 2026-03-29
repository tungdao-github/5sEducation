# AI Security Review (Senior Workflow)

Goal: use AI to review security in a senior-style workflow, without providing hacking guidance.

## 1) Safe prompt templates
1) "Review API controllers for auth/role checks, IDOR, and data leakage. List risks by severity."
2) "Scan auth flows for lockout, rate limit, token handling, and error leakage."
3) "Review upload endpoints for size/MIME/path traversal risks. Suggest fixes."
4) "Review search/suggest endpoints for data exposure and rate limiting."
5) "Review admin endpoints for missing [Authorize]/roles."

## 2) Senior process
- List endpoints by role.
- Check: role access, data scope, input validation.
- Check logs and rate limit coverage.
- Create tickets and fix high/critical issues first.

## 3) Use AI safely
- AI helps review code and detect risks.
- Test only within allowed scope.
- Do not run unauthorized attacks.

## 4) Expected output
- Risk list (High/Medium/Low)
- Related file/line
- Clear fix suggestions
