Gmail	TPrunus persica ĐV <tungdao123pzo@gmail.com>
hn
Daiviet our house <daivietourhouse@gmail.com>	lúc 14:18 3 tháng 11, 2025
Đến: tungdao123pzo@gmail.com
TÀI LIỆU PHÂN TÍCH HỆ THỐNG 
1. EXECUTIVE SUMMARY
1.1. Tổng quan dự án
Website học trực tuyến giúp kết nối giảng viên và học viên, cung cấp các khóa học đa dạng với hệ thống thanh toán tích hợp và AI hỗ trợ học tập.

1.2. Mục tiêu kinh doanh
Đạt 10,000 học viên trong năm đầu

Doanh thu  tỷ VNĐ/năm

1,000+ khóa học trên nền tảng

Tỷ lệ hoàn thành khóa học: 60%

1.3. Phạm vi dự án
Phát triển website học trực tuyến full-stack

Tích hợp thanh toán MoMo

Tích hợp AI (GPT-4/Gemini/Claude)

Hệ thống quản lý nội dung và người dùng

2. PHÂN TÍCH YÊU CẦU NGHIỆP VỤ
2.1. Các đối tượng người dùng (User Personas)
A. Học viên (Students)

Người đi làm (25-35 tuổi):

Muốn nâng cao kỹ năng nghề nghiệp

Thời gian linh hoạt, học vào tối/cuối tuần

Cần chứng chỉ để thăng tiến

Sinh viên (18-24 tuổi):

Học thêm kiến thức ngoài trường

Ngân sách hạn chế, tìm khóa miễn phí/giảm giá

Quan tâm đến xu hướng công nghệ mới

Học sinh (15-18 tuổi):

Ôn thi THPT, luyện thi đại học

Cần giải bài tập chi tiết

Phụ huynh thanh toán

B. Giảng viên (Instructors)

Chuyên gia trong lĩnh vực

Muốn kiếm thu nhập thụ động

Cần công cụ dễ upload nội dung

Theo dõi doanh thu và học viên

C. Quản trị viên (Admin)

Quản lý toàn bộ hệ thống

Duyệt khóa học và giảng viên

Giải quyết tranh chấp

Theo dõi doanh thu

D. Đối tác/Affiliate

Giới thiệu học viên để nhận hoa hồng

Theo dõi hiệu quả marketing

Nhận thanh toán hàng tháng

3. YÊU CẦU CHỨC NĂNG CHI TIẾT
3.1. MODULE ĐĂNG KÝ VÀ ĐĂNG NHẬP
A. Đăng ký tài khoản
User Story: "Là người dùng mới, tôi muốn đăng ký tài khoản để truy cập các khóa học"

Chức năng:

Đăng ký bằng email và mật khẩu

Đăng ký qua Google OAuth

Đăng ký qua Facebook OAuth

Xác thực email sau khi đăng ký

Chọn vai trò: Học viên hoặc Giảng viên

Validation:

Email phải đúng định dạng

Mật khẩu tối thiểu 8 ký tự (chữ hoa, chữ thường, số, ký tự đặc biệt)

Kiểm tra email đã tồn tại

Checkbox đồng ý điều khoản sử dụng

Luồng xử lý:

1. User nhập thông tin đăng ký

2. System validate dữ liệu

3. System kiểm tra email có tồn tại không

4. System tạo tài khoản và gửi email xác thực

5. User click link trong email

6. System kích hoạt tài khoản

7. Chuyển đến trang dashboard

B. Đăng nhập
User Story: "Là học viên đã có tài khoản, tôi muốn đăng nhập để tiếp tục học"

Chức năng:

Đăng nhập bằng email/mật khẩu

Đăng nhập bằng Google/Facebook

Nhớ đăng nhập (Remember me)

Quên mật khẩu

Two-Factor Authentication (2FA) - optional

Quên mật khẩu:

1. User click "Quên mật khẩu"

2. Nhập email

3. System gửi link reset password

4. User click link và nhập mật khẩu mới

5. System cập nhật mật khẩu

6. Thông báo thành công

3.2. MODULE QUẢN LÝ KHÓA HỌC
A. Xem danh sách khóa học (Public)
User Story: "Là khách vãng lai, tôi muốn xem danh sách khóa học để tìm khóa phù hợp"

Chức năng:

Hiển thị grid/list view

Filter theo:

Danh mục (Lập trình, Marketing, Thiết kế, Ngôn ngữ, Kinh doanh...)

Giá (Miễn phí, Dưới 500k, 500k-1tr, Trên 1tr)

Level (Beginner, Intermediate, Advanced)

Rating (4 sao trở lên, 3 sao trở lên...)

Thời lượng (Dưới 3h, 3-6h, 6-12h, Trên 12h)

Ngôn ngữ (Tiếng Việt, Tiếng Anh)

Sort theo:

Mới nhất

Phổ biến nhất

Rating cao nhất

Giá thấp đến cao

Giá cao đến thấp

Search theo tên khóa học, giảng viên

Pagination (20 khóa học/trang)

Thông tin hiển thị mỗi khóa học:

Thumbnail ảnh

Tên khóa học

Tên giảng viên + avatar

Rating (sao) và số lượng đánh giá

Giá (hoặc "Miễn phí")

Số học viên đã đăng ký

Label "Bestseller", "New", "Hot"

Nút "Xem chi tiết"

B. Chi tiết khóa học
User Story: "Là người quan tâm, tôi muốn xem chi tiết khóa học để quyết định mua"

Nội dung trang:

Header:

Tên khóa học

Tagline ngắn gọn

Rating + số đánh giá

Số học viên

Thời lượng tổng

Ngôn ngữ

Last updated

Button "Mua ngay" hoặc "Đăng ký miễn phí"

Video giới thiệu:

Preview 5-10 phút đầu miễn phí

Player video tích hợp

Nội dung khóa học:

Mô tả chi tiết (HTML rich text)

Bạn sẽ học được gì (bullet points)

Yêu cầu trước khóa học

Đối tượng học viên phù hợp

Chương trình học:

Accordion list các section

Mỗi section có lessons

Hiển thị duration mỗi video

Icon khóa/mở khóa lessons

Preview một số bài miễn phí

Giảng viên:

Ảnh đại diện

Tên và chức danh

Bio ngắn

Số khóa học đã tạo

Số học viên

Rating trung bình

Link "Xem thêm khóa học của giảng viên"

Đánh giá:

Tổng quan rating (5 sao, 4 sao...)

Danh sách review từ học viên

Sort theo: Mới nhất, Hữu ích nhất

Pagination

Khóa học liên quan:

4-6 khóa học tương tự

Carousel slider

Sidebar (sticky):

Video preview

Giá khóa học

Discount (nếu có)

Button "Mua ngay"

Button "Thêm vào giỏ hàng"

Button "Yêu thích"

Thông tin bao gồm:

X giờ video

X tài liệu

X bài tập

Truy cập trọn đời

Chứng chỉ hoàn thành

Chia sẻ mạng xã hội

C. Tạo khóa học (Dành cho giảng viên)
User Story: "Là giảng viên, tôi muốn tạo khóa học mới để bán"

Bước 1: Thông tin cơ bản

Tên khóa học (required)

Tagline (required)

Danh mục (dropdown, required)

Subcategory (dropdown)

Level (Beginner/Intermediate/Advanced)

Ngôn ngữ

Thumbnail image (upload)

Video giới thiệu (upload hoặc URL YouTube)

Bước 2: Chương trình học

Tạo sections

Mỗi section có:

Tiêu đề section

Mô tả ngắn

Thứ tự

Mỗi section chứa lessons:

Tiêu đề lesson

Loại nội dung:

Video (upload file hoặc URL)

Tài liệu (PDF, Word, PPT)

Bài tập (Quiz)

Text/Article

Thời lượng

Preview miễn phí (checkbox)

Thứ tự

Bước 3: Mô tả khóa học

Mô tả chi tiết (Rich text editor)

Bạn sẽ học được gì (thêm/xóa bullet points)

Yêu cầu (thêm/xóa items)

Đối tượng học viên (thêm/xóa items)

Bước 4: Định giá

Miễn phí hoặc Trả phí

Giá (VNĐ)

Giá khuyến mãi (optional)

Thời gian khuyến mãi

Bước 5: Review và Publish

Preview toàn bộ khóa học

Submit để Admin duyệt

Trạng thái: Draft / Pending Review / Published / Rejected

D. Quản lý khóa học đã mua (Dashboard học viên)
User Story: "Là học viên, tôi muốn xem các khóa học đã mua để tiếp tục học"

Chức năng:

Danh sách khóa học đã đăng ký

Mỗi khóa học hiển thị:

Thumbnail

Tên khóa học

Giảng viên

Progress bar (% hoàn thành)

Button "Tiếp tục học"

Button "Xem chứng chỉ" (nếu hoàn thành)

Filter: Đang học / Đã hoàn thành / Chưa bắt đầu

Sort: Mới nhất / Cũ nhất / Progress

3.3. MODULE HỌC BÀI
A. Giao diện học bài
User Story: "Là học viên, tôi muốn học bài với trải nghiệm tốt nhất"

Layout:

Sidebar trái:

Danh sách sections và lessons

Checkbox hoàn thành mỗi lesson

Progress bar tổng thể

Button "Ghi chú"

Vùng nội dung chính:

Video player (nếu là video lesson)

Play/Pause

Tua nhanh/chậm

Tốc độ phát (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)

Chất lượng (360p, 480p, 720p, 1080p)

Fullscreen

PIP (Picture in Picture)

Subtitle (nếu có)

Hoặc PDF viewer

Hoặc Article text

Hoặc Quiz interface

Tabs dưới video:

Overview (mô tả bài học)

Ghi chú của tôi

Q&A (hỏi đáp với giảng viên)

Tài liệu đính kèm

Navigation:

Button "Bài trước"

Button "Bài tiếp theo"

Button "Đánh dấu hoàn thành"

Chức năng nâng cao:

Ghi chú theo timestamp (click vào ghi chú để jump đến thời điểm trong video)

Tự động lưu progress

Resume từ vị trí đã xem

Download tài liệu PDF

B. Hệ thống Quiz/Bài tập
User Story: "Là học viên, tôi muốn làm bài tập để kiểm tra kiến thức"

Loại câu hỏi:

Multiple Choice (Trắc nghiệm)

1 đáp án đúng

Nhiều đáp án đúng

True/False

Fill in the blank (Điền từ)

Short Answer (Tự luận ngắn)

Coding Challenge (cho khóa lập trình)

Code editor tích hợp

Run code và check output

Chức năng:

Giới hạn thời gian (optional)

Số lần làm bài (unlimited hoặc giới hạn)

Hiển thị đáp án sau khi submit

Giải thích chi tiết

Điểm số và phần trăm đúng

Xem lại bài làm

Retake quiz

Điều kiện pass:

Đạt tối thiểu X% điểm

Nếu không pass, phải làm lại để tiếp tục

3.4. MODULE THANH TOÁN
A. Giỏ hàng
User Story: "Là học viên, tôi muốn thêm nhiều khóa học vào giỏ để thanh toán một lần"

Chức năng:

Thêm khóa học vào giỏ

Xem danh sách giỏ hàng

Xóa khóa học khỏi giỏ

Áp dụng mã giảm giá

Hiển thị:

Giá gốc

Giá giảm

Tổng tiền

VAT (nếu có)

B. Checkout
User Story: "Là học viên, tôi muốn thanh toán nhanh chóng và an toàn"

Thông tin cần nhập:

Họ tên

Email (nhận hóa đơn)

Số điện thoại

Địa chỉ (optional)

Thông tin xuất hóa đơn (optional):

Tên công ty

Mã số thuế

Địa chỉ công ty

Phương thức thanh toán:

MoMo QR

MoMo App

Thẻ ATM

Thẻ Visa/Mastercard

ZaloPay

VNPay

Luồng thanh toán MoMo:

1. User chọn khóa học và click "Mua ngay"

2. Điền thông tin checkout

3. Chọn phương thức thanh toán: MoMo

4. Backend gọi MoMo API tạo payment request

5. MoMo trả về payment URL hoặc QR code

6. User scan QR hoặc redirect sang MoMo app

7. User xác nhận thanh toán trên MoMo

8. MoMo callback về backend (IPN - Instant Payment Notification)

9. Backend verify signature từ MoMo

10. Backend cập nhật trạng thái đơn hàng: Success

11. Backend kích hoạt quyền truy cập khóa học cho user

12. Gửi email xác nhận đơn hàng

13. Redirect user về trang "Cảm ơn" và link vào khóa học

Xử lý lỗi:

Thanh toán thất bại → Thông báo lỗi, cho phép thử lại

Timeout → Hủy đơn hàng tự động sau 15 phút

Callback không về → Cronjob check trạng thái với MoMo API

C. Quản lý đơn hàng
User Story: "Là học viên, tôi muốn xem lịch sử mua hàng"

Chức năng:

Danh sách đơn hàng

Chi tiết đơn hàng:

Mã đơn hàng

Ngày mua

Khóa học đã mua

Tổng tiền

Phương thức thanh toán

Trạng thái: Pending / Success / Failed / Refunded

Download hóa đơn (PDF)

Yêu cầu hoàn tiền (trong 7 ngày đầu, chưa học quá 30%)

D. Mã giảm giá (Coupon)
User Story: "Là học viên, tôi muốn sử dụng mã giảm giá để tiết kiệm chi phí"

Loại coupon:

Giảm % (10%, 20%, 50%...)

Giảm cố định (50k, 100k, 200k...)

Freeship (không áp dụng cho khóa học online)

Buy 1 Get 1

Điều kiện:

Giá trị đơn hàng tối thiểu

Áp dụng cho danh mục cụ thể

Áp dụng cho khóa học cụ thể

Áp dụng cho user mới

Giới hạn số lần sử dụng

Thời gian có hiệu lực

3.5. MODULE GIẢNG VIÊN
A. Dashboard giảng viên
User Story: "Là giảng viên, tôi muốn theo dõi hiệu suất khóa học của mình"

Metrics hiển thị:

Tổng doanh thu

Doanh thu tháng này

Tổng số học viên

Học viên mới tháng này

Số khóa học đã publish

Rating trung bình

Số đánh giá mới

Biểu đồ:

Doanh thu theo tháng (12 tháng gần nhất)

Học viên mới theo tháng

Top 5 khóa học bán chạy nhất

Danh sách khóa học:

Tên khóa học

Trạng thái (Draft/Published/Under Review)

Số học viên

Doanh thu

Rating

Actions: Edit / View / Delete

B. Quản lý học viên
User Story: "Là giảng viên, tôi muốn xem danh sách học viên của tôi"

Chức năng:

Danh sách học viên theo khóa học

Thông tin học viên:

Tên

Email

Ngày đăng ký

Progress (%)

Có hoàn thành hay chưa

Export danh sách (CSV/Excel)

Gửi email thông báo đến học viên

C. Q&A với học viên
User Story: "Là giảng viên, tôi muốn trả lời câu hỏi của học viên"

Chức năng:

Danh sách câu hỏi từ học viên

Filter: Chưa trả lời / Đã trả lời / Tất cả

Sort: Mới nhất / Cũ nhất

Trả lời câu hỏi (rich text)

Upvote/Downvote câu hỏi

Pin câu hỏi quan trọng

Xóa câu hỏi spam

D. Quản lý doanh thu
User Story: "Là giảng viên, tôi muốn theo dõi thu nhập và rút tiền"

Chức năng:

Xem doanh thu chi tiết:

Theo khóa học

Theo tháng

Tổng doanh thu

Hoa hồng của platform (VD: 30%)

Thu nhập thực nhận (70%)

Lịch sử giao dịch

Yêu cầu rút tiền:

Nhập số tiền

Nhập thông tin ngân hàng

Platform xử lý trong 3-5 ngày làm việc

Trạng thái rút tiền: Pending / Processing / Completed / Rejected

3.6. MODULE ADMIN
A. Dashboard tổng quan
User Story: "Là admin, tôi muốn xem tổng quan hệ thống"

Metrics:

Tổng số học viên

Tổng số giảng viên

Tổng số khóa học

Tổng doanh thu

Doanh thu hôm nay/tuần này/tháng này

Số đơn hàng mới

Khóa học chờ duyệt

Biểu đồ:

Doanh thu 12 tháng

Người dùng mới theo tháng

Top 10 khóa học bán chạy

Top 10 giảng viên có doanh thu cao

B. Quản lý người dùng
User Story: "Là admin, tôi muốn quản lý tất cả người dùng"

Chức năng:

Danh sách user (học viên + giảng viên)

Search theo tên, email

Filter theo:

Role (Student/Instructor/Admin)

Status (Active/Banned/Inactive)

Ngày đăng ký

Chi tiết user:

Thông tin cá nhân

Khóa học đã mua (học viên)

Khóa học đã tạo (giảng viên)

Lịch sử giao dịch

Hoạt động gần đây

Actions:

Ban user (khóa tài khoản)

Unban user

Reset password

Xóa user

Chỉnh sửa thông tin

C. Quản lý khóa học
User Story: "Là admin, tôi muốn kiểm duyệt và quản lý khóa học"

Chức năng:

Danh sách tất cả khóa học

Filter theo:

Status (Published/Pending/Draft/Rejected)

Danh mục

Giá

Ngày tạo

Duyệt khóa học:

Xem preview khóa học

Approve (phê duyệt)

Reject (từ chối + lý do)

Unpublish khóa học (nếu vi phạm)

Xóa khóa học

Chỉnh sửa thông tin khóa học

D. Quản lý đơn hàng
User Story: "Là admin, tôi muốn theo dõi tất cả giao dịch"

Chức năng:

Danh sách đơn hàng

Filter theo:

Trạng thái (Success/Pending/Failed/Refunded)

Phương thức thanh toán

Khoảng thời gian

Giá trị đơn hàng

Chi tiết đơn hàng

Xử lý hoàn tiền (Refund):

Kiểm tra điều kiện

Approve/Reject yêu cầu hoàn tiền

Xử lý hoàn tiền qua MoMo

Export báo cáo (Excel)

E. Quản lý danh mục
User Story: "Là admin, tôi muốn quản lý danh mục khóa học"

Chức năng:

Thêm danh mục mới

Sửa danh mục

Xóa danh mục (nếu không có khóa học)

Thêm subcategory

Sắp xếp thứ tự hiển thị

Ví dụ danh mục:

Lập trình

Web Development

Mobile Development

Data Science

DevOps

Marketing

Digital Marketing

SEO

Content Marketing

Thiết kế

UI/UX Design

Graphic Design

Video Editing

Kinh doanh

Entrepreneurship

Management

Finance

Ngôn ngữ

Tiếng Anh

Tiếng Nhật

Tiếng Hàn

F. Quản lý mã giảm giá
User Story: "Là admin, tôi muốn tạo và quản lý coupon"

Chức năng:

Tạo coupon mới

Chỉnh sửa coupon

Kích hoạt/Vô hiệu hóa coupon

Xem thống kê sử dụng

Xóa coupon

G. Báo cáo và thống kê
User Story: "Là admin, tôi muốn xem báo cáo chi tiết"

Các báo cáo:

Báo cáo doanh thu:

Theo ngày/tuần/tháng/năm

Theo danh mục

Theo giảng viên

Theo phương thức thanh toán

Báo cáo người dùng:

Người dùng mới

Tỷ lệ active users

User retention

Báo cáo khóa học:

Khóa học mới

Khóa học hot nhất

Tỷ lệ hoàn thành

Export tất cả báo cáo (Excel/PDF)

3.7. MODULE AI HỖ TRỢ
A. Chatbot tư vấn khóa học
User Story: "Là khách hàng, tôi muốn được AI tư vấn khóa học phù hợp"

Chức năng:

Chatbox ở góc phải màn hình

AI hỏi về:

Mục tiêu học tập

Level hiện tại

Thời gian có thể học

Ngân sách

AI gợi ý 3-5 khóa học phù hợp

Link trực tiếp đến khóa học

Kịch bản hội thoại:

AI: Xin chào! Tôi có thể giúp bạn tìm khóa học phù hợp. Bạn muốn học về lĩnh vực gì?

User: Tôi muốn học lập trình web

AI: Tuyệt vời! Bạn đã có kinh nghiệm gì về lập trình chưa?

User: Tôi hoàn toàn mới

AI: Hiểu rồi. Bạn có bao nhiêu thời gian mỗi tuần để học?

User: Khoảng 10 giờ

AI: Dựa trên thông tin của bạn, tôi gợi ý 3 khóa học sau:

1. [Lập trình Web từ Zero đến Hero] - 40 giờ - 599k

2. [HTML/CSS/JavaScript cho người mới] - 30 giờ - 399k

3. [Full-Stack Web Development] - 60 giờ - 999k


3.8. Security (Bảo mật)
A. Authentication & Authorization:

JWT token cho API authentication

Refresh token để gia hạn session

Token expiry: Access token 15 phút, Refresh token 7 ngày

Two-Factor Authentication (2FA) optional

Password hashing: bcrypt (salt rounds: 10)


3.9. Usability 
A. Responsive Design:
Mobile-first approach

Breakpoints:

Mobile: 320px - 767px

Tablet: 768px - 1023px

Desktop: 1024px+

B. Browser Support:

Chrome (2 versions mới nhất)

Firefox (2 versions mới nhất)

Safari (2 versions mới nhất)

Edge (2 versions mới nhất)

Mobile browsers (iOS Safari, Chrome Android)

C. Internationalization (i18n):

Multi-language support:

Tiếng Việt (default)

English

RTL support (nếu có Arabic, Hebrew)

Currency localization (VNĐ, USD)

Date/time format theo locale

D. User Experience:

Loading states cho async operations

Error messages rõ ràng, hữu ích

Confirmation dialogs cho actions quan trọng

Undo/Redo cho editing

Form validation real-time

Progress indicators

Empty states với CTA rõ ràng

E. Documentation:

API documentation (Swagger/OpenAPI)

Code comments cho logic phức tạp

README cho mỗi module

Architecture decision records (ADRs)

Runbooks cho production issues

F. Logging:

Structured logging (JSON format)

Log levels: DEBUG, INFO, WARN, ERROR

Request ID tracking

Performance metrics logging

User action logging (audit trail)

G. Version Control:

Git flow hoặc GitHub flow

Branch naming convention

Commit message convention

Protected main branch

Squash merge

5. TECHNOLOGY STACK CHI TIẾT
5.1. Frontend
A. Core:

React 18+: UI library

TypeScript: Type safety

Vite: Build tool (nhanh hơn CRA)

B. State Management:

Redux Toolkit: Global state

React Query: Server state, caching

Zustand: Light-weight state (alternative)

C. Routing:

React Router v6: Client-side routing

D. UI Components:

Tailwind CSS: Utility-first CSS

Headless UI: Accessible components

Radix UI: Primitive components

Framer Motion: Animations

E. Forms:

React Hook Form: Form handling

Zod: Schema validation

F. Rich Text Editor:

Lexical hoặc Slate.js: Cho mô tả khóa học, Q&A

G. Video Player:

Video.js: Customizable player

Plyr: Modern player

Cloudflare Stream: Managed solution

H. Charts:

Recharts: For analytics

Chart.js: Alternative

I. Testing:

Vitest: Unit tests

Testing Library: Component tests

Playwright: E2E tests

5.2. Backend
A. Runtime:

Node.js 20+ LTS

B. Framework:

Express.js: Web framework

Fastify: Alternative (nhanh hơn)

C. API:

REST API

GraphQL (optional, cho complex queries)

D. Authentication:

Passport.js: Authentication middleware

jsonwebtoken: JWT handling

E. Validation:

Joi hoặc Zod: Request validation

F. File Upload:

Multer: Handle multipart/form-data

Sharp: Image processing

FFmpeg: Video processing

G. Job Queue:

Bull: Redis-based queue

Use cases:

Send emails

Process videos

Generate certificates

Daily reports

H. Email:

Nodemailer: Send emails

SendGrid hoặc AWS SES: Email service

I. Payment:

MoMo SDK: MoMo integration

Stripe: International payments (optional)

J. AI Integration:

OpenAI SDK: GPT-4 API

Google AI SDK: Gemini API

Anthropic SDK: Claude API

K. Testing:

Jest: Unit tests

Supertest: API tests

5.3. Database
A. Primary Database:

MongoDB 7+

Mongoose: ODM

B. Caching:

Redis 7+: Caching, sessions, queues

C. Search Engine:

Elasticsearch: Full-text search (optional)

MongoDB Atlas Search: Built-in search

D. Object Storage:

AWS S3 hoặc DigitalOcean Spaces: Videos, images, files

5.4. DevOps
A. Version Control:

GitHub hoặc GitLab

B. CI/CD:

GitHub Actions

GitLab CI

Jenkins

C. Containerization:

Docker: Containerize apps

Docker Compose: Local development

D. Orchestration (nếu scale lớn):

Kubernetes: Container orchestration

Docker Swarm: Simpler alternative

E. Infrastructure as Code:

Terraform: Provision infrastructure

F. Monitoring:

Datadog: APM, monitoring

New Relic: Alternative

Grafana + Prometheus: Open-source

G. Error Tracking:

Sentry: Error tracking

H. Logging:

ELK Stack (Elasticsearch, Logstash, Kibana)

Loki + Grafana: Alternative

I. CDN:

Cloudflare: CDN, DDoS protection

AWS CloudFront: Alternative

5.5. Third-party Services
A. Payment:

MoMo: Vietnam e-wallet

VNPay: Vietnam payment gateway

ZaloPay: Alternative

Stripe: International

B. AI:

OpenAI GPT-4: Text generation, Q&A

Google Gemini: Alternative

Anthropic Claude: Alternative

C. Video:

Cloudflare Stream: Video hosting + streaming

AWS MediaConvert: Video transcoding

Vimeo: Alternative

D. Email:

SendGrid: Email delivery

AWS SES: Alternative

Mailgun: Alternative

E. SMS:

Twilio: SMS notifications

VIETGUYS: Vietnam SMS

F. Analytics:

Google Analytics 4: Web analytics

Mixpanel: Product analytics

Hotjar: Heatmaps, session recordings

G. Customer Support:

Intercom: Live chat, helpdesk

Zendesk: Alternative

Crisp: Budget-friendly


🚀 PHASE 1: CƠ SỞ HẠ TẦNG & XÁC THỰC 
Công việc chính:
Setup môi trường dev/staging/production

Hệ thống đăng ký/đăng nhập (Email, Google, Facebook OAuth)

Quên mật khẩu, xác thực email

JWT authentication + refresh token

Setup database (MongoDB) + Redis caching

Phân quyền user: Học viên, Giảng viên, Admin

Deliverables:
User có thể đăng ký, đăng nhập

Quản lý profile cơ bản

API documentation cơ bản

🎓 PHASE 2: MODULE KHÓA HỌC - PUBLIC 
Công việc chính:
Trang danh sách khóa học (filter, sort, search, pagination)

Trang chi tiết khóa học

Preview video miễn phí

Hệ thống đánh giá (rating & reviews)

Khóa học liên quan

Giỏ hàng

Responsive design đầy đủ

Deliverables:
Khách có thể browse và xem chi tiết khóa học

Thêm khóa học vào giỏ hàng

UI/UX hoàn chỉnh

💳 PHASE 3: THANH TOÁN & ĐƠN HÀNG 
Công việc chính:
Tích hợp MoMo payment gateway

Tích hợp VNPay/ZaloPay (optional)

Luồng checkout hoàn chỉnh

Xử lý callback & IPN

Hệ thống mã giảm giá (coupon)

Quản lý đơn hàng

Email xác nhận + hóa đơn PDF

Xử lý hoàn tiền (refund)

Deliverables:
Học viên thanh toán thành công

Tự động kích hoạt khóa học

Email thông báo

Lịch sử giao dịch

📚 PHASE 4: MODULE HỌC BÀI 
Công việc chính:
Dashboard học viên (khóa học đã mua)

Giao diện học bài với video player

Sidebar navigation (sections/lessons)

Progress tracking tự động

Hệ thống ghi chú (note-taking với timestamp)

Q&A trong từng bài học

Download tài liệu

Hệ thống Quiz/Bài tập (multiple choice, coding challenge)

Chứng chỉ hoàn thành

Deliverables:
Học viên học bài mượt mà

Tự động lưu tiến độ

Quiz và đánh giá kiến thức

👨‍🏫 PHASE 5: MODULE GIẢNG VIÊN 
Công việc chính:
Tạo khóa học (wizard 5 bước)

Upload video/tài liệu (S3 hoặc Spaces)

Rich text editor cho mô tả

Quản lý sections/lessons

Định giá khóa học

Dashboard giảng viên (doanh thu, học viên, analytics)

Trả lời Q&A học viên

Quản lý học viên

Rút tiền về tài khoản

Deliverables:
Giảng viên tạo và quản lý khóa học

Theo dõi doanh thu

Tương tác với học viên

🔧 PHASE 6: MODULE ADMIN 
Công việc chính:
Dashboard tổng quan (metrics + charts)

Quản lý người dùng (ban/unban, reset password)

Duyệt khóa học (approve/reject)

Quản lý đơn hàng

Quản lý danh mục

Quản lý coupon

Báo cáo chi tiết (doanh thu, user, khóa học)

Export Excel/PDF

Deliverables:
Admin kiểm soát toàn bộ hệ thống

Duyệt nội dung

Báo cáo kinh doanh

🤖 PHASE 7: TÍCH HỢP AI 
Công việc chính:
Chatbot tư vấn khóa học (GPT-4/Gemini/Claude)

AI gợi ý khóa học dựa trên profile

AI trả lời câu hỏi thường gặp

AI hỗ trợ giải bài tập (optional)

Training model với dữ liệu khóa học

Deliverables:
Chatbot hoạt động 24/7

Tăng conversion rate

Cải thiện UX

🎨 PHASE 8: OPTIMIZATION & ENHANCEMENT 
Công việc chính:
Performance optimization (lazy loading, code splitting)

SEO optimization (meta tags, sitemap, schema markup)

Image optimization (WebP, lazy load)

Video transcoding multiple quality

Caching strategy (Redis)

Security hardening (rate limiting, CSRF, XSS)

Accessibility (WCAG 2.1)

Deliverables:
Website load nhanh (<3s)

SEO-friendly

Bảo mật tốt

🧪 PHASE 9: TESTING & QA 
Công việc chính:
Unit testing (frontend + backend)

Integration testing

E2E testing (Playwright)

Load testing (k6, Artillery)

Security testing (OWASP)

Cross-browser testing

Mobile responsive testing

UAT với khách hàng

Deliverables:
Test coverage >80%

Bug-free

Performance benchmarks

🚢 PHASE 10: DEPLOYMENT & GO-LIVE Công việc chính:
Setup production environment

CI/CD pipeline (GitHub Actions)

Monitoring & logging (Sentry, Datadog)

CDN setup (Cloudflare)

SSL certificate

Backup strategy

Launch checklist

Training cho admin/support team

Documentation đầy đủ

Deliverables:
Website live production

Monitoring active

Team được training

🔄 PHASE 11: POST-LAUNCH SUPPORT 
Công việc chính:
Bug fixes

Performance tuning

User feedback implementation

Analytics monitoring

Monthly reports

Scale infrastructure nếu cần

Deliverables:
Hệ thống ổn định

Issues được xử lý kịp thời

Continuous improvement


