# Security Test Plan (Role-Based)

Goal: test security for each actor (guest, user, instructor, admin) in a senior-style workflow, with AI-assisted review.

## 1) Actors and scope
- Guest (not logged in)
- Student (regular user)
- Instructor
- Admin
- Support (if applicable)

## 2) Common checklist (applies to all)
- AuthN: protected endpoints return 401/403 when not logged in.
- AuthZ: no access to other users' data (IDOR prevention).
- Input validation: block XSS/HTML/JS injection.
- Rate limit: login, reset pass, search, upload.
- File upload: enforce file type, size, MIME, filename.
- Logging: log important actions (login fail, update profile, upload).
- Error handling: no sensitive detail leakage (stack traces).

## 3) Auth & Account
Guest:
- Register, login, forgot password are rate-limited.
- Reset password: one-time token, expires.

Student:
- Cannot access admin/instructor endpoints.
- Can only view/update own profile.

Instructor:
- CRUD only own courses.
- Cannot edit courses from other instructors.

Admin:
- Admin endpoints require Admin role.

## 4) Courses & Learning
Guest:
- Only public courses.
- No lesson content access.

Student:
- Only lessons for enrolled courses.
- No access to courses not enrolled.

Instructor:
- Only edit lessons for own courses.

## 5) Search & Suggestions
- Search returns public data only (or scoped by role).
- No sensitive data leakage in suggestions.
- Rate limit suggestions.

## 6) Uploads (video/file)
- Only instructor/admin can upload.
- Validate size, MIME, extension.
- Block path traversal.
- Log uploads (who, when, which course).

## 7) Payments/Orders (if any)
- Price cannot be overridden client-side.
- Webhooks only from payment provider.
- Order status changes restricted to admin.

## 8) Admin
- CRUD categories, courses, blog posts.
- Import/Export requires role.
- No user data leakage in public responses.

## 9) Support chat
- No access to other users' tickets.
- Admin can update status/notes.
- Rate limit messages.

## 10) SEO/Blog
- Public sees only published posts.
- Admin-only CRUD.

## 11) How to test (manual + automated)
- Manual: test each role in UI.
- API: call endpoints with role tokens and check 401/403.
- Automated: run security-check scripts.

## 12) Outcome
- List failing endpoints, role bypasses, data leaks.
- Create tickets and fix by severity.
