# Sitemap + User Flow (5sEducation)

## 1. Sitemap (routes)
Public core
- / (Home)
- /courses (Listing + filters)
- /courses/[slug] (Course detail)
- /paths (Learning paths)
- /blog (Blog list)
- /blog/[slug] (Blog detail)
- /support (Support landing)
- /faq (FAQ)
- /policy/privacy
- /policy/terms

Auth
- /login
- /register
- /confirm-email
- /forgot-password
- /reset-password

User
- /dashboard (My learning)
- /learn/[slug] (Course player)
- /account (Profile)
- /orders (Order history)
- /orders/[id] (Order detail)
- /wishlist
- /compare
- /cart

Admin
- /admin (Dashboard)
- /admin/categories
- /admin/courses
- /admin/learning-paths
- /admin/homepage-blocks
- /admin/blog
- /studio (Instructor workspace)

## 2. Key user flows
1. New user onboarding
Step 1: Land on home, search, open a course detail page.
Step 2: Register account.
Step 3: Confirm email via link.
Step 4: Login, receive JWT, persist token in client storage.

2. Purchase flow
Step 1: Browse courses or search with filters.
Step 2: Open course detail, add to cart or enroll.
Step 3: Checkout (cart -> order created).
Step 4: Email confirmation + order status in /orders.

3. Learning flow
Step 1: From order or enroll, open /learn/[slug].
Step 2: Track progress and resume lessons.
Step 3: Review course after completion.

4. Support flow
Step 1: Open /support or chat widget.
Step 2: Create support message (anonymous or authenticated).
Step 3: Receive replies and status updates.

5. Admin content flow
Step 1: Admin login.
Step 2: Update homepage blocks, banners, and featured sections.
Step 3: Publish changes and clear cache if needed.

## 3. Notes
- Routes align with current Next.js app structure in apps/web.
- Auth and data actions rely on API endpoints in apps/api.
- Phases can be enabled gradually without breaking sitemap.
