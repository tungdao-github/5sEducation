export interface BlogPost {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  author: string;
  authorAvatar: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  readTime: number;
  views: number;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    title: '10 xu hướng thiết kế UX/UI năm 2026',
    titleEn: '10 UX/UI Design Trends in 2026',
    slug: '10-xu-huong-thiet-ke-ux-ui-2026',
    excerpt: 'Khám phá các xu hướng thiết kế giao diện người dùng đang định hình tương lai của ngành công nghệ...',
    excerptEn: 'Discover UI/UX design trends shaping the future of tech industry...',
    content: `<p>Ngành thiết kế UX/UI đang trải qua giai đoạn biến đổi mạnh mẽ với sự xuất hiện của AI, AR/VR và các công nghệ mới. Dưới đây là 10 xu hướng nổi bật nhất trong năm 2026.</p>
<h2>1. Thiết kế với AI hỗ trợ</h2>
<p>Trí tuệ nhân tạo đang thay đổi cách chúng ta tiếp cận thiết kế. Từ tự động hóa các tác vụ lặp lại đến gợi ý thiết kế thông minh...</p>
<h2>2. Neomorphism và Glassmorphism</h2>
<p>Các phong cách thiết kế mới này kết hợp ánh sáng và bóng tối để tạo ra các giao diện có chiều sâu...</p>
<h2>3. Motion Design và Micro-interactions</h2>
<p>Chuyển động tinh tế giúp người dùng hiểu hơn về hành động của họ trên giao diện...</p>`,
    contentEn: `<p>The UX/UI design industry is undergoing major transformation with AI, AR/VR and new technologies. Here are the top 10 trends for 2026.</p>`,
    author: 'Nguyễn Minh Tuấn',
    authorAvatar: '',
    date: '2026-03-15',
    category: 'Thiết kế UX/UI',
    tags: ['UX', 'UI', 'Xu hướng', '2026'],
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
    readTime: 8,
    views: 3420,
  },
  {
    id: 'b2',
    title: 'Cách viết Microcopy hiệu quả cho ứng dụng mobile',
    titleEn: 'How to Write Effective Microcopy for Mobile Apps',
    slug: 'cach-viet-microcopy-hieu-qua',
    excerpt: 'Microcopy là những đoạn văn bản nhỏ nhưng có sức ảnh hưởng lớn đến trải nghiệm người dùng...',
    excerptEn: 'Microcopy is small text with huge impact on user experience...',
    content: `<p>Microcopy – những đoạn văn bản nhỏ trong giao diện – có thể tạo ra sự khác biệt lớn giữa một ứng dụng được yêu thích và một ứng dụng bị bỏ qua.</p>
<h2>Microcopy là gì?</h2>
<p>Microcopy bao gồm các nút, nhãn form, thông báo lỗi, placeholder text và mọi đoạn văn bản ngắn trong UI...</p>
<h2>3 nguyên tắc vàng của Microcopy</h2>
<p><strong>1. Rõ ràng:</strong> Nói đúng những gì người dùng cần biết...</p>
<p><strong>2. Ngắn gọn:</strong> Loại bỏ từ thừa, giữ lại những gì quan trọng...</p>
<p><strong>3. Cá tính:</strong> Thể hiện giọng nói thương hiệu một cách nhất quán...</p>`,
    contentEn: `<p>Microcopy – small interface texts – can make a huge difference between a loved app and an ignored one.</p>`,
    author: 'Trần Thị Hoa',
    authorAvatar: '',
    date: '2026-02-28',
    category: 'Viết nội dung UX',
    tags: ['Microcopy', 'UX Writing', 'Mobile'],
    image: 'https://images.unsplash.com/photo-1586943759341-be5595944989?w=800&auto=format&fit=crop',
    readTime: 6,
    views: 2150,
  },
  {
    id: 'b3',
    title: 'Nguyên tắc Gestalt và ứng dụng trong thiết kế web',
    titleEn: 'Gestalt Principles and Their Application in Web Design',
    slug: 'nguyen-tac-gestalt-trong-thiet-ke-web',
    excerpt: 'Tìm hiểu cách các nguyên tắc tâm lý học Gestalt giúp tạo ra giao diện web trực quan hơn...',
    excerptEn: 'Learn how Gestalt psychology principles help create more intuitive web interfaces...',
    content: `<p>Tâm lý học Gestalt cung cấp cho chúng ta framework mạnh mẽ để hiểu cách não bộ xử lý thông tin thị giác.</p>
<h2>Các nguyên tắc cơ bản</h2>
<p><strong>Proximity (Gần gũi):</strong> Các phần tử gần nhau được coi là thuộc cùng một nhóm...</p>
<p><strong>Similarity (Tương đồng):</strong> Các phần tử trông giống nhau được liên kết với nhau...</p>
<p><strong>Closure (Đóng kín):</strong> Não bộ tự hoàn thiện các hình dạng chưa đầy đủ...</p>`,
    contentEn: `<p>Gestalt psychology provides a powerful framework for understanding how the brain processes visual information.</p>`,
    author: 'Lê Văn Hùng',
    authorAvatar: '',
    date: '2026-02-10',
    category: 'Thiết kế UX/UI',
    tags: ['Gestalt', 'Psychology', 'Web Design'],
    image: 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=800&auto=format&fit=crop',
    readTime: 10,
    views: 4890,
  },
  {
    id: 'b4',
    title: 'Nghiên cứu người dùng từ A đến Z: Hướng dẫn toàn diện',
    titleEn: 'User Research A to Z: A Comprehensive Guide',
    slug: 'nghien-cuu-nguoi-dung-toan-dien',
    excerpt: 'Hướng dẫn đầy đủ về các phương pháp nghiên cứu người dùng để đưa ra quyết định thiết kế...',
    excerptEn: 'Complete guide to user research methods for data-driven design decisions...',
    content: `<p>Nghiên cứu người dùng là nền tảng của mọi quyết định thiết kế tốt. Không có nghiên cứu, chúng ta chỉ đang đoán mò về nhu cầu của người dùng.</p>
<h2>Các phương pháp nghiên cứu định tính</h2>
<p><strong>User Interviews:</strong> Phỏng vấn trực tiếp để khám phá động lực và nhu cầu sâu xa...</p>
<p><strong>Usability Testing:</strong> Quan sát người dùng thực hiện nhiệm vụ để phát hiện vấn đề...</p>`,
    contentEn: `<p>User research is the foundation of every good design decision. Without research, we're just guessing about user needs.</p>`,
    author: 'Phạm Thu Hằng',
    authorAvatar: '',
    date: '2026-01-20',
    category: 'Nghiên cứu UX',
    tags: ['User Research', 'Usability', 'Methods'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
    readTime: 15,
    views: 6230,
  },
  {
    id: 'b5',
    title: 'Design System: Tại sao mọi team thiết kế cần nó',
    titleEn: 'Design System: Why Every Design Team Needs One',
    slug: 'design-system-tai-sao-can',
    excerpt: 'Design System không chỉ là component library – đây là ngôn ngữ thiết kế chung của cả tổ chức...',
    excerptEn: 'Design System is not just a component library – it\'s the shared design language of an organization...',
    content: `<p>Một Design System tốt có thể tăng tốc độ phát triển sản phẩm lên 50% và đảm bảo tính nhất quán trên toàn bộ sản phẩm.</p>`,
    contentEn: `<p>A good Design System can speed up product development by 50% and ensure consistency across the entire product.</p>`,
    author: 'Nguyễn Minh Tuấn',
    authorAvatar: '',
    date: '2026-01-05',
    category: 'Thiết kế UX/UI',
    tags: ['Design System', 'Components', 'Consistency'],
    image: 'https://images.unsplash.com/photo-1683818051102-dd1199d163b9?w=800&auto=format&fit=crop',
    readTime: 7,
    views: 3100,
  },
  {
    id: 'b6',
    title: 'Analytics trong UX: Đọc dữ liệu để cải thiện trải nghiệm',
    titleEn: 'Analytics in UX: Reading Data to Improve Experience',
    slug: 'analytics-trong-ux',
    excerpt: 'Học cách sử dụng dữ liệu analytics để đưa ra quyết định thiết kế sáng suốt hơn...',
    excerptEn: 'Learn how to use analytics data to make smarter design decisions...',
    content: `<p>Dữ liệu analytics cung cấp bức tranh khách quan về hành vi người dùng mà không thể có được qua phỏng vấn hay quan sát.</p>`,
    contentEn: `<p>Analytics data provides an objective picture of user behavior that can't be obtained through interviews or observations alone.</p>`,
    author: 'Trần Văn Đức',
    authorAvatar: '',
    date: '2025-12-20',
    category: 'Phân tích UX',
    tags: ['Analytics', 'Data', 'UX Metrics'],
    image: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?w=800&auto=format&fit=crop',
    readTime: 9,
    views: 2780,
  },
];

export const blogCategories = ['Tất cả', 'Thiết kế UX/UI', 'Viết nội dung UX', 'Nghiên cứu UX', 'Phân tích UX'];
