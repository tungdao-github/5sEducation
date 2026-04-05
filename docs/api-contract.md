# API Contract (Frontend <-> Backend)

Base URL
- Use `NEXT_PUBLIC_API_URL` in frontend.
- Example: https://fiveseducation.onrender.com

Auth
- POST /api/auth/register
Request
```
{
  "email": "user@example.com",
  "password": "ChangeMe123!",
  "firstName": "Tung",
  "lastName": "Dao"
}
```
Response
```
{ "message": "Account created. Please confirm your email." }
```

- POST /api/auth/login
Request
```
{ "email": "user@example.com", "password": "ChangeMe123!" }
```
Response
```
{ "token": "...", "expiresAt": "2026-04-03T00:00:00Z", "user": { "id": "...", "email": "...", "loyaltyPoints": 120, "loyaltyTier": "Silver" } }
```

- POST /api/auth/google
Request
```
{ "idToken": "google-id-token" }
```
Response: AuthResponse

- GET /api/auth/me (auth)
- PUT /api/auth/me (auth)
Request
```
{ "firstName": "Tung", "lastName": "Dao", "avatarUrl": "..." }
```

- POST /api/auth/change-password (auth)
Request
```
{ "currentPassword": "old", "newPassword": "new" }
```

- POST /api/auth/forgot-password
Request
```
{ "email": "user@example.com" }
```

- POST /api/auth/reset-password
Request
```
{ "userId": "...", "token": "...", "newPassword": "ChangeMe123!" }
```

- POST /api/auth/confirm-email
Request
```
{ "userId": "...", "token": "..." }
```

- POST /api/auth/resend-confirmation
Request
```
{ "email": "user@example.com" }
```

Catalog
- GET /api/categories
Response: CategoryDto[]

- GET /api/courses
Query params: search, category, level, language, minPrice, maxPrice, minRating, sort, page, pageSize
Response: CourseListDto[]
Headers: X-Total-Count

- GET /api/courses/{slug}
Response: CourseDetailDto

- GET /api/courses/{slug}/related?take=6
Response: CourseListDto[]

- GET /api/courses/compare?ids=1,2,3,4
Response: CourseCompareDto[]

Learning paths
- GET /api/learning-paths
- GET /api/learning-paths/{slug}

Search
- GET /api/search/suggestions?query=react
Response: SearchSuggestionDto[]

Home page blocks
- GET /api/homepage/blocks?locale=vi
Response: HomePageBlockDto[]

HomePageBlockDto (frontend rendering hints)
- type: hero | cta | feature | stats | testimonial
- ItemsJson formats
  - hero/feature: ["bullet 1", "bullet 2"]
  - stats:
  ```
  [
    { "value": "120+", "label": "Mentor hours", "subLabel": "Weekly reviews" },
    { "value": "95%", "label": "Completion rate" }
  ]
  ```
  - testimonial:
  ```
  [
    { "quote": "Clear, practical, and fast.", "name": "Minh Tran", "role": "PM", "company": "Fintech" }
  ]
  ```

Cart (auth)
- GET /api/cart
- POST /api/cart
Request
```
{ "courseId": 1, "quantity": 1 }
```
- DELETE /api/cart/{courseId}
- POST /api/cart/checkout
Response: OrderDto

Orders (auth)
- GET /api/orders/my
Response: OrderDto[]

Admin Orders (role Admin)
- GET /api/admin/orders?status=paid
Response: OrderAdminDto[]
- PUT /api/admin/orders/{id}/status
Request
```
{ "status": "processing" }
```

Admin Users (role Admin)
- GET /api/admin/users
Response: UserDto[]
- GET /api/admin/users/roles
Response: ["Admin","Instructor","User"]
- PUT /api/admin/users/{id}/roles
Request
```
{ "roles": ["Admin","User"] }
```

Admin Audit Logs (role Admin)
- GET /api/admin/audit-logs?query=admin&take=80
Response: AdminAuditLogDto[]

Admin Reviews (role Admin)
- GET /api/admin/reviews?courseId=1&query=great&take=120
Response: AdminReviewDto[]
- DELETE /api/admin/reviews/{id}

Admin Stats (role Admin)
- GET /api/admin/stats/overview
Response: AdminStatsOverviewDto (includes revenueLast30Days, ordersByStatus, topCoursesByRevenue)

Settings (public)
- GET /api/settings?keys=siteName,logoUrl,footerTagline
Response: SystemSettingDto[]

Admin Settings (role Admin)
- GET /api/admin/settings
Response: SystemSettingDto[]
- PUT /api/admin/settings/{key}
Request
```
{ "value": "New value" }
```

Admin Cache (role Admin)
- POST /api/admin/cache/clear
Response
```
{ "message": "Cache cleared.", "cacheVersion": "2026-04-03T00:00:00.000Z" }
```

Wishlist (auth)
- GET /api/wishlist
- POST /api/wishlist
Request
```
{ "courseId": 1 }
```
- DELETE /api/wishlist/{courseId}

Reviews
- GET /api/reviews?courseId=1
- POST /api/reviews (auth)
Request
```
{ "courseId": 1, "rating": 5, "comment": "Great course" }
```
- DELETE /api/reviews/{courseId} (auth)

Admin Reviews (role Admin)
- GET /api/admin/reviews?courseId=1&query=great&take=120
Response: AdminReviewDto[]
- DELETE /api/admin/reviews/{id}

Support
- POST /api/support/messages
Request
```
{ "name": "Tung", "email": "user@example.com", "message": "Need help" }
```
- GET /api/support/messages (auth)
- GET /api/support/messages/{id}/replies (auth)
- POST /api/support/messages/{id}/replies (auth)
Request
```
{ "message": "Reply text" }
```

Addresses (auth)
- GET /api/addresses
- POST /api/addresses
Request
```
{
  "label": "Home",
  "recipientName": "Tung Dao",
  "phone": "0900000000",
  "line1": "12 Nguyen Trai",
  "line2": "",
  "city": "Hanoi",
  "state": "",
  "postalCode": "100000",
  "country": "Vietnam",
  "isDefault": true
}
```
- PUT /api/addresses/{id}
- DELETE /api/addresses/{id}

Admin (role Admin)
- /api/admin/homepage/blocks (GET, POST)
- /api/admin/homepage/blocks/{id} (PUT, DELETE)
- /api/admin/categories (CRUD)
- /api/admin/blog/posts (CRUD)
- /api/admin/learning-paths (CRUD)
- /api/admin/stats (overview)

Instructor/Admin Courses (role Admin,Instructor)
- GET /api/instructor/courses
- GET /api/instructor/courses/{id}
- POST /api/courses (multipart/form-data)
- PUT /api/courses/{id} (multipart/form-data)
- DELETE /api/courses/{id}
