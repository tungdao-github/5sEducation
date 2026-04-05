# Lo trinh frontend 5sEducation (Online Learning + E-commerce)

## 0. Muc tieu & pham vi
- Xay dung giao dien hoc online va mua khoa hoc theo tieu chuan senior, co the mo rong thanh e-commerce tong quat.
- Tap trung vao trai nghiem nguoi dung, toc do, SEO, va tinh linh hoat trong quan tri noi dung.
- Phu hop stack hien tai: `apps/web` (Next.js App Router) + `apps/api` (.NET API).

## 1. Nguyen tac UI/UX
- Responsive hoan toan, uu tien mobile first.
- Da ngon ngu (vi/en), co co che chuyen doi ngon ngu toan site.
- Accessibility co ban (keyboard, contrast, focus states).
- Thi?t ke nhat quan, co design system ro rang.
- Toc do la uu tien: lazy load, skeleton, cache, tranh block render.

## 2. So do thong tin & dieu huong

### 2.1 Public
- Trang chu (block-based, quan tri vien co the sap xep, bat/tat, doi noi dung).
- Danh muc khoa hoc/san pham.
- Trang tim kiem (loc nang cao, goi y, voice search).
- Trang chi tiet khoa hoc/san pham.
- Blog/News.
- Support/FAQ/Policy.

### 2.2 Auth
- Dang ky, dang nhap, xac thuc email.
- Dang nhap Google/Facebook.
- Quen mat khau, dat lai qua email (OTP/code).

### 2.3 User
- Ho so ca nhan.
- Quan ly dia chi.
- Lich su don hang.
- Khoa hoc cua toi.
- Wishlist, Compare, Viewed history.
- Doi mat khau.

### 2.4 Learning
- Course player, bai giang, tai lieu, ghi chu.
- Tien do hoc, badge/certificate.
- Learning paths.

### 2.5 Admin
- Dashboard thong ke (doanh thu, nguoi dung, don hang, khoa hoc).
- CRUD danh muc, khoa hoc/san pham, bien the.
- Quan ly noi dung (blog, banner, home blocks).
- Quan ly don hang, khach hang, feedback.
- Phan quyen, log hanh dong.

## 3. Tinh nang nguoi dung (chi tiet)

### 3.1 Trang chu (CMS block)
- Hero/banner + CTA.
- Section khoa hoc noi bat.
- Flash sale theo gio.
- Stats/metrics block (so lieu noi bat).
- Testimonials/quotes block.
- Testimonials + logos.
- CTA dang ky.

### 3.2 Tim kiem & kham pha
- Tim kiem nang cao theo gia, danh muc, rating, cap do, giang vien.
- Goi y tu dong khi go tu khoa.
- Voice search (Web Speech API + fallback).
- Loc theo thuong hieu/thuoc tinh (m? r?ng cho e-commerce).

### 3.3 Chi tiet khoa hoc/san pham
- Mo ta chi tiet, noi dung bai hoc, giang vien.
- Danh gia sao, binh luan.
- Related products/courses.
- Frequently bought together.
- Add to cart / enroll.

### 3.4 Gio hang & thanh toan
- Chon/xoa tung san pham.
- Ma giam gia.
- Phi ship tu dong theo dia chi.
- Thanh toan VNPay, ZaloPay (phase 2).
- Email xac nhan don hang.
- Xuat hoa don PDF.

### 3.5 Tai khoan
- Profile, dia chi, phuong thuc thanh toan.
- Lich su mua, trang thai don.
- Wishlist, compare, viewed.
- Tich diem/loyalty.

## 4. Tinh nang admin (chi tiet)

### 4.1 Quan ly noi dung
- CRUD blog/news.
- Quan ly banner, home blocks keo tha.
- Quan ly thu vien tai nguyen (anh, video, PDF).

### 4.2 Quan ly khoa hoc/san pham
- CRUD khoa hoc, bai giang, bien the.
- Import/Export CSV/Excel.

### 4.3 Don hang & khach hang
- Quan ly don hang theo trang thai.
- Import/Export don hang.
- Quan ly user, role, permission.

### 4.4 He thong
- SEO config (meta, OG, sitemap).
- Log hanh dong admin.
- Clear cache giao dien.

## 5. He thong ho tro
- i18n, SEO, sitemap, robots.
- Chat support (live chat or widget).
- Analytics (page view, funnel conversion).
- Error monitoring (client + server).
- File storage microservice (upload/serve tu API).

## 6. Design system & component library
- Tokens: mau sac, font, spacing, radius, shadow.
- Components: button, input, select, badge, card, modal, drawer.
- Layout: header, footer, sidebar, breadcrumb.
- Data display: table, grid, tabs, pagination.
- Feedback: toast, alert, loading, skeleton.

## 7. Hop dong API (front - back)
- Auth: login, register, refresh, verify email, forgot/reset.
- Catalog: categories, courses/products, search.
- Orders: cart, checkout, payment.
- CMS: home blocks, banners, blog posts.
- User: profile, addresses, wishlist, history.

## 8. Lo trinh trien khai

### Phase 0 (Foundation)
- Chuan hoa layout, header/footer, design tokens.
- i18n, theming, routing.
- Auth flow co ban.

### Phase 1 (MVP Browse)
- Trang chu, danh muc, chi tiet khoa hoc.
- Tim kiem + loc co ban.
- Wishlist.

### Phase 2 (Commerce)
- Gio hang, checkout.
- Email confirm, order status.
- Flash sale, related products.

### Phase 3 (Learning)
- Course player.
- Progress, certificate.

### Phase 4 (Admin + CMS)
- Dashboard, CRUD, home blocks.
- Roles, permissions.

### Phase 5 (Growth)
- Voice search.
- Loyalty, referrals.
- Advanced analytics.

## 11. CMS Home Blocks JSON examples

### Stats block (ItemsJson)
```
[
  { "value": "120+", "label": "Mentor hours", "subLabel": "Weekly review cycles" },
  { "value": "95%", "label": "Completion rate" }
]
```

### Testimonial block (ItemsJson)
```
[
  { "quote": "Clear feedback loops and practical projects kept me shipping every week.", "name": "Minh Tran", "role": "Product Designer", "company": "Fintech" }
]
```

## 9. Tieu chi hoan thanh (DoD)
- Tien do load nhanh, UI no lag tren mobile.
- SEO onpage day du, sitemap hop le.
- Auth flow day du, test duoc.
- Admin co the cap nhat banner, noi dung, va home blocks.

## 10. Ghi chu ky thuat
- Frontend doc se cap nhat theo API thuc te.
- Uu tien lam tung phase, test o moi phase truoc khi mo rong.
