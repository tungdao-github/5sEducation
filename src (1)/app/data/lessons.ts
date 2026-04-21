// ─── Data types ──────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple' | 'true_false';
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface CourseExercise {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // 0 = no limit (minutes)
  passingScore: number; // percentage 0–100
  questions: QuizQuestion[];
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'zip' | 'slides';
  url: string;
  size?: string;
}

export interface CourseLessonItem {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  type: 'video' | 'quiz' | 'reading';
  duration: string; // "08:30" for video, "10 phút" for quiz
  description: string;
  resources: LessonResource[];
  exercise?: CourseExercise; // only for type === 'quiz'
  isPreview: boolean;
  order: number;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: CourseLessonItem[];
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function q(
  id: string,
  type: QuizQuestion['type'],
  question: string,
  options: string[],
  correctAnswer: string | string[],
  explanation: string,
  points = 10,
): QuizQuestion {
  return { id, type, question, options, correctAnswer, explanation, points };
}

function exercise(
  id: string,
  title: string,
  description: string,
  timeLimit: number,
  passingScore: number,
  questions: QuizQuestion[],
): CourseExercise {
  return { id, title, description, timeLimit, passingScore, questions };
}

// ─── Course 1 – Gestalt ───────────────────────────────────────────────────────

const c1s1: CourseSection = {
  id: 'c1s1', courseId: '1', order: 1,
  title: 'Nguồn gốc của Tâm lý học Gestalt',
  lessons: [
    {
      id: 'c1s1l1', sectionId: 'c1s1', courseId: '1', order: 1,
      title: 'Gestalt là gì? – Giới thiệu tổng quan',
      type: 'video', duration: '06:45', isPreview: true,
      description: 'Bài học mở đầu giới thiệu khái niệm Gestalt, nguồn gốc từ tiếng Đức "hình thức/cấu trúc", và tại sao nó quan trọng trong thiết kế UX/UI hiện đại.',
      resources: [
        { id: 'r1', title: 'Tài liệu bài 1 – Gestalt Overview', type: 'pdf', url: '#', size: '1.2 MB' },
        { id: 'r2', title: 'Gestalt Psychology – Wikipedia', type: 'link', url: 'https://en.wikipedia.org/wiki/Gestalt_psychology' },
      ],
    },
    {
      id: 'c1s1l2', sectionId: 'c1s1', courseId: '1', order: 2,
      title: 'Lịch sử hình thành Tâm lý học Gestalt',
      type: 'video', duration: '09:20', isPreview: true,
      description: 'Tìm hiểu về Max Wertheimer, Kurt Koffka và Wolfgang Köhler – ba nhà tâm lý học đã đặt nền tảng cho trường phái Gestalt vào đầu thế kỷ 20.',
      resources: [
        { id: 'r3', title: 'Timeline Gestalt Pioneers', type: 'slides', url: '#', size: '2.4 MB' },
      ],
    },
    {
      id: 'c1s1l3', sectionId: 'c1s1', courseId: '1', order: 3,
      title: 'Tại sao Gestalt quan trọng với UX Designer?',
      type: 'video', duration: '07:55', isPreview: false,
      description: 'Phân tích cách não bộ tổ chức thông tin thị giác và cách ứng dụng điều này để tạo ra giao diện trực quan, dễ hiểu hơn.',
      resources: [],
    },
    {
      id: 'c1s1l4', sectionId: 'c1s1', courseId: '1', order: 4,
      title: '🧪 Kiểm tra Chương 1',
      type: 'quiz', duration: '10 phút', isPreview: false,
      description: 'Kiểm tra kiến thức về nguồn gốc và nền tảng lý thuyết Gestalt.',
      resources: [],
      exercise: exercise('ex_c1s1', 'Quiz: Nguồn gốc Gestalt', 'Trả lời 5 câu hỏi để kiểm tra hiểu biết về lịch sử và khái niệm Gestalt.', 10, 60, [
        q('q1', 'single', '"Gestalt" trong tiếng Đức có nghĩa là gì?', ['Màu sắc', 'Hình thức / cấu trúc', 'Đường nét', 'Không gian'], 'Hình thức / cấu trúc', 'Gestalt là từ tiếng Đức, nghĩa là "hình thức" hoặc "cấu trúc tổng thể", phản ánh ý tưởng rằng toàn thể lớn hơn tổng các phần.'),
        q('q2', 'single', 'Ai là người sáng lập trường phái Tâm lý học Gestalt?', ['Sigmund Freud', 'Carl Jung', 'Max Wertheimer', 'Abraham Maslow'], 'Max Wertheimer', 'Max Wertheimer được coi là người sáng lập trường phái Gestalt, cùng với Kurt Koffka và Wolfgang Köhler.'),
        q('q3', 'true_false', 'Nguyên tắc Gestalt xuất hiện vào cuối thế kỷ 19 tại Mỹ.', ['Đúng', 'Sai'], 'Sai', 'Tâm lý học Gestalt ra đời vào đầu thế kỷ 20 tại Đức, không phải Mỹ. Max Wertheimer công bố nghiên cứu đầu tiên năm 1912.'),
        q('q4', 'multiple', 'Trong thiết kế UX, Gestalt giúp designer làm điều gì? (Chọn tất cả đúng)', ['Tổ chức thông tin rõ ràng hơn', 'Lập trình front-end', 'Tạo giao diện trực quan hơn', 'Hướng dẫn mắt người dùng'], ['Tổ chức thông tin rõ ràng hơn', 'Tạo giao diện trực quan hơn', 'Hướng dẫn mắt người dùng'], 'Gestalt giúp designer tổ chức thông tin logic, tạo giao diện dễ đọc và hướng dẫn mắt người dùng di chuyển tự nhiên trên màn hình.'),
        q('q5', 'single', 'Nguyên lý nào của Gestalt phát biểu: "Toàn thể lớn hơn tổng của các phần"?', ['Nguyên lý Gần gũi', 'Nguyên lý Tương đồng', 'Nguyên lý Prägnanz', 'Nguyên lý Liên tục'], 'Nguyên lý Prägnanz', 'Nguyên lý Prägnanz (hay Law of Good Gestalt) phát biểu rằng não người luôn có xu hướng tổ chức thông tin thành hình thức đơn giản, gọn gàng nhất.'),
      ]),
    },
  ],
};

const c1s2: CourseSection = {
  id: 'c1s2', courseId: '1', order: 2,
  title: 'Những nền tảng của nhận thức thị giác',
  lessons: [
    {
      id: 'c1s2l1', sectionId: 'c1s2', courseId: '1', order: 1,
      title: 'Cách não bộ xử lý hình ảnh',
      type: 'video', duration: '11:30', isPreview: false,
      description: 'Khám phá cơ chế hoạt động của não bộ khi nhìn nhận hình ảnh: từ mắt đến vỏ não thị giác, và tại sao não luôn tìm kiếm "trật tự".',
      resources: [
        { id: 'r4', title: 'Visual Perception Reference Guide', type: 'pdf', url: '#', size: '3.1 MB' },
      ],
    },
    {
      id: 'c1s2l2', sectionId: 'c1s2', courseId: '1', order: 2,
      title: 'Figure-Ground: Hình và Nền',
      type: 'video', duration: '13:15', isPreview: false,
      description: 'Tìm hiểu nguyên tắc Figure-Ground – cách não phân biệt đối tượng chính (hình) với bối cảnh (nền) – và ứng dụng vào thiết kế UI.',
      resources: [
        { id: 'r5', title: 'Figure-Ground Examples (Figma)', type: 'link', url: '#' },
      ],
    },
    {
      id: 'c1s2l3', sectionId: 'c1s2', courseId: '1', order: 3,
      title: 'Khoảng trắng (White Space) và sức mạnh của nó',
      type: 'video', duration: '10:40', isPreview: false,
      description: 'Khoảng trắng không phải là "không gian trống" – đây là công cụ thiết kế mạnh mẽ giúp tạo ra sự tập trung, dễ đọc và sang trọng.',
      resources: [],
    },
    {
      id: 'c1s2l4', sectionId: 'c1s2', courseId: '1', order: 4,
      title: 'Cân bằng thị giác và Điểm neo (Anchor Points)',
      type: 'video', duration: '09:55', isPreview: false,
      description: 'Cân bằng thị giác ảnh hưởng thế nào đến trải nghiệm người dùng? Học cách tạo cân bằng đối xứng và bất đối xứng trong giao diện.',
      resources: [],
    },
    {
      id: 'c1s2l5', sectionId: 'c1s2', courseId: '1', order: 5,
      title: '🧪 Kiểm tra Chương 2',
      type: 'quiz', duration: '12 phút', isPreview: false,
      description: 'Bài kiểm tra về nhận thức thị giác và nguyên tắc Figure-Ground.',
      resources: [],
      exercise: exercise('ex_c1s2', 'Quiz: Nhận thức thị giác', 'Kiểm tra hiểu biết về cách não xử lý hình ảnh và khoảng trắng.', 12, 60, [
        q('q6', 'single', 'Trong thiết kế UI, "Figure" (Hình) là gì?', ['Màu nền của trang', 'Phần tử chính mà người dùng tập trung vào', 'Đường viền của element', 'Font chữ được dùng'], 'Phần tử chính mà người dùng tập trung vào', 'Figure là đối tượng hoặc phần tử chính trong tầm nhìn, còn Ground là bối cảnh/nền xung quanh nó.'),
        q('q7', 'true_false', 'Khoảng trắng (White Space) luôn phải có màu trắng.', ['Đúng', 'Sai'], 'Sai', 'White Space không nhất thiết phải trắng – đây là khái niệm chỉ vùng không gian trống giữa các phần tử, có thể bất kỳ màu nào.'),
        q('q8', 'single', 'Cân bằng thị giác đối xứng (Symmetrical balance) có đặc điểm gì?', ['Các phần tử phân bố ngẫu nhiên', 'Hai nửa của thiết kế là gương của nhau', 'Chỉ dùng màu đơn sắc', 'Không có điểm trọng tâm'], 'Hai nửa của thiết kế là gương của nhau', 'Cân bằng đối xứng tạo ra sự ổn định và chắc chắn, phù hợp cho các trang web trang trọng như ngân hàng, chính phủ.'),
        q('q9', 'multiple', 'Khoảng trắng giúp giao diện đạt được điều gì? (Chọn tất cả đúng)', ['Dễ đọc hơn', 'Tạo cảm giác sang trọng', 'Định hướng sự chú ý', 'Tiết kiệm băng thông'], ['Dễ đọc hơn', 'Tạo cảm giác sang trọng', 'Định hướng sự chú ý'], 'Khoảng trắng giúp cải thiện khả năng đọc, tạo cảm giác cao cấp và hướng mắt người dùng đến các phần tử quan trọng.'),
        q('q10', 'single', 'Hình logo nào nổi tiếng nhất minh họa nguyên tắc Figure-Ground?', ['Logo Apple', 'Logo FedEx với mũi tên ẩn', 'Logo Nike', 'Logo Google'], 'Logo FedEx với mũi tên ẩn', 'Logo FedEx có mũi tên ẩn trong khoảng trống giữa chữ "E" và "x" là ví dụ kinh điển về Figure-Ground – não nhận ra cả chữ lẫn hình ẩn.'),
      ]),
    },
  ],
};

const c1s3: CourseSection = {
  id: 'c1s3', courseId: '1', order: 3,
  title: 'Nguyên tắc dựa trên thuộc tính',
  lessons: [
    {
      id: 'c1s3l1', sectionId: 'c1s3', courseId: '1', order: 1,
      title: 'Nguyên tắc Tương đồng (Similarity)',
      type: 'video', duration: '12:00', isPreview: false,
      description: 'Não người nhóm các phần tử có hình dạng, màu sắc, kích thước giống nhau lại với nhau. Học cách dùng Similarity để tạo pattern rõ ràng trong UI.',
      resources: [{ id: 'r6', title: 'Similarity in UI – Case Studies', type: 'pdf', url: '#', size: '2.8 MB' }],
    },
    {
      id: 'c1s3l2', sectionId: 'c1s3', courseId: '1', order: 2,
      title: 'Nguyên tắc Gần gũi (Proximity)',
      type: 'video', duration: '10:15', isPreview: false,
      description: 'Các phần tử gần nhau được coi là liên quan. Nguyên tắc Proximity là nền tảng của cách tổ chức nội dung trong form, card, và navigation.',
      resources: [],
    },
    {
      id: 'c1s3l3', sectionId: 'c1s3', courseId: '1', order: 3,
      title: 'Nguyên tắc Liên tục (Continuity)',
      type: 'video', duration: '11:30', isPreview: false,
      description: 'Mắt người có xu hướng theo dõi đường thẳng và đường cong. Học cách dùng Continuity để tạo flow tự nhiên và dẫn dắt người dùng.',
      resources: [],
    },
    {
      id: 'c1s3l4', sectionId: 'c1s3', courseId: '1', order: 4,
      title: 'Nguyên tắc Khép kín (Closure)',
      type: 'video', duration: '08:45', isPreview: false,
      description: 'Não người tự hoàn thiện hình dạng chưa đầy đủ. Closure cho phép designer tạo ra logo sáng tạo và giao diện gọn gàng hơn.',
      resources: [],
    },
    {
      id: 'c1s3l5', sectionId: 'c1s3', courseId: '1', order: 5,
      title: '🧪 Bài tập: Nhận diện Gestalt trong UI thực tế',
      type: 'quiz', duration: '15 phút', isPreview: false,
      description: 'Nhận diện và phân tích các nguyên tắc Gestalt trong các UI nổi tiếng như Google, Airbnb, Spotify.',
      resources: [],
      exercise: exercise('ex_c1s3', 'Bài tập: Gestalt trong UI thực tế', 'Phân tích nguyên tắc Gestalt trong các thiết kế UI nổi tiếng. Cần đạt 70% để qua bài.', 15, 70, [
        q('q11', 'single', 'Khi một danh sách các nút CTA (Call-to-Action) có cùng màu xanh lá, nguyên tắc nào đang được áp dụng?', ['Proximity', 'Similarity', 'Closure', 'Figure-Ground'], 'Similarity', 'Similarity – khi các phần tử có cùng màu sắc, người dùng hiểu chúng có cùng chức năng/tầm quan trọng.'),
        q('q12', 'single', 'Form đăng ký với label được đặt ngay trên input field sử dụng nguyên tắc nào?', ['Closure', 'Continuity', 'Proximity', 'Figure-Ground'], 'Proximity', 'Proximity – label gần input field giúp người dùng hiểu ngay label đó thuộc về field nào.'),
        q('q13', 'true_false', 'Carousel với các dots chỉ số trang ở dưới sử dụng nguyên tắc Continuity để gợi ý có thể vuốt sang trái/phải.', ['Đúng', 'Sai'], 'Đúng', 'Đúng – các dots liên tiếp tạo ra gợi ý về "tính liên tục" và hướng dẫn người dùng kéo theo hướng ngang.'),
        q('q14', 'multiple', 'Nguyên tắc nào giúp designer giảm số lượng phần tử mà vẫn truyền đạt được thông tin? (Chọn 2)', ['Closure', 'Proximity', 'Continuity', 'Similarity'], ['Closure', 'Similarity'], 'Closure cho phép não tự hoàn thiện hình dạng thiếu; Similarity cho phép dùng pattern thay vì label cho từng phần tử.'),
        q('q15', 'single', 'Navigation bar với các menu items cách đều nhau đang áp dụng nguyên tắc gì để cho thấy chúng "cùng cấp độ"?', ['Closure', 'Similarity', 'Proximity', 'Figure-Ground'], 'Proximity', 'Sự phân cách đều nhau (equal spacing) giúp não nhận ra các items có cùng hierarchy – đây là ứng dụng của Proximity.'),
      ]),
    },
  ],
};

const c1s4: CourseSection = {
  id: 'c1s4', courseId: '1', order: 4,
  title: 'Nguyên tắc dựa trên sự thay đổi',
  lessons: [
    { id: 'c1s4l1', sectionId: 'c1s4', courseId: '1', order: 1, title: 'Nguyên tắc Chuyển động chung (Common Fate)', type: 'video', duration: '09:30', isPreview: false, description: 'Các phần tử di chuyển cùng hướng được coi là một nhóm. Ứng dụng trong animation và micro-interactions.', resources: [] },
    { id: 'c1s4l2', sectionId: 'c1s4', courseId: '1', order: 2, title: 'Nguyên tắc Đồng bộ (Synchrony)', type: 'video', duration: '07:45', isPreview: false, description: 'Các phần tử thay đổi cùng lúc được coi là liên quan. Quan trọng trong thiết kế animation phức tạp.', resources: [] },
    { id: 'c1s4l3', sectionId: 'c1s4', courseId: '1', order: 3, title: '🧪 Kiểm tra Chương 4', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Kiểm tra về các nguyên tắc động.', resources: [],
      exercise: exercise('ex_c1s4', 'Quiz: Nguyên tắc dựa trên sự thay đổi', 'Kiểm tra hiểu biết về Common Fate và Synchrony.', 10, 60, [
        q('q16', 'single', 'Khi hover vào một card và cả image lẫn text cùng phóng to, đây là ứng dụng của nguyên tắc nào?', ['Proximity', 'Common Fate', 'Similarity', 'Closure'], 'Common Fate', 'Common Fate – các phần tử phản ứng cùng nhau được nhìn nhận là một đơn vị.'),
        q('q17', 'true_false', 'Skeleton loading animation áp dụng nguyên tắc Synchrony bằng cách làm tất cả các placeholder nhấp nháy cùng lúc.', ['Đúng', 'Sai'], 'Đúng', 'Đúng – các skeleton elements nhấp nháy đồng bộ giúp người dùng hiểu rằng toàn bộ trang đang loading cùng lúc.'),
        q('q18', 'single', 'Dropdown menu với các items xuất hiện từ trên xuống theo thứ tự áp dụng nguyên tắc nào?', ['Synchrony', 'Common Fate', 'Continuity', 'Closure'], 'Continuity', 'Items xuất hiện tuần tự theo một hướng tạo ra cảm giác liên tục, giúp mắt dễ theo dõi.'),
      ]) },
  ],
};

const c1s5: CourseSection = {
  id: 'c1s5', courseId: '1', order: 5,
  title: 'Nguyên tắc dựa trên đường viền',
  lessons: [
    { id: 'c1s5l1', sectionId: 'c1s5', courseId: '1', order: 1, title: 'Vùng chung (Common Region)', type: 'video', duration: '10:20', isPreview: false, description: 'Các phần tử trong cùng vùng biên giới (border, background) được coi là nhóm.', resources: [] },
    { id: 'c1s5l2', sectionId: 'c1s5', courseId: '1', order: 2, title: 'Kết nối (Connectedness)', type: 'video', duration: '08:30', isPreview: false, description: 'Các phần tử nối với nhau bằng đường thẳng được coi là liên quan.', resources: [] },
    { id: 'c1s5l3', sectionId: 'c1s5', courseId: '1', order: 3, title: '🧪 Kiểm tra Chương 5', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Kiểm tra về các nguyên tắc đường viền.', resources: [],
      exercise: exercise('ex_c1s5', 'Quiz: Nguyên tắc đường viền', 'Kiểm tra kiến thức về Common Region và Connectedness.', 10, 60, [
        q('q19', 'single', 'Card UI với border radius và shadow áp dụng nguyên tắc nào để nhóm các phần tử?', ['Similarity', 'Common Region', 'Proximity', 'Closure'], 'Common Region', 'Common Region – border và background tạo ra "vùng chung" giúp não nhận diện card là một đơn vị.'),
        q('q20', 'true_false', 'Breadcrumb navigation (Home > Products > Shoes) sử dụng nguyên tắc Connectedness.', ['Đúng', 'Sai'], 'Đúng', 'Đúng – dấu ">" kết nối các mục, cho thấy hierarchy và mối quan hệ giữa các trang.'),
      ]) },
  ],
};

const c1s6: CourseSection = {
  id: 'c1s6', courseId: '1', order: 6,
  title: 'Áp dụng lý thuyết Gestalt vào công việc',
  lessons: [
    { id: 'c1s6l1', sectionId: 'c1s6', courseId: '1', order: 1, title: 'Gestalt trong Design Review', type: 'video', duration: '13:00', isPreview: false, description: 'Cách dùng Gestalt như một checklist trong quá trình review thiết kế.', resources: [] },
    { id: 'c1s6l2', sectionId: 'c1s6', courseId: '1', order: 2, title: 'Case Study: Redesign với Gestalt', type: 'video', duration: '18:30', isPreview: false, description: 'Phân tích một case study thực tế: cải thiện UI của một app bằng cách áp dụng Gestalt principles.', resources: [] },
    { id: 'c1s6l3', sectionId: 'c1s6', courseId: '1', order: 3, title: '📖 Đọc thêm: Gestalt trong Accessibility', type: 'reading', duration: '8 phút', isPreview: false, description: 'Tài liệu đọc về cách Gestalt hỗ trợ thiết kế cho người khiếm thị và rối loạn nhận thức.', resources: [{ id: 'r7', title: 'Gestalt & Accessibility Checklist', type: 'pdf', url: '#', size: '0.9 MB' }] },
    { id: 'c1s6l4', sectionId: 'c1s6', courseId: '1', order: 4, title: '🎓 Bài kiểm tra cuối khóa – Gestalt', type: 'quiz', duration: '20 phút', isPreview: false, description: 'Bài kiểm tra tổng hợp toàn bộ nội dung khóa học Gestalt. Cần đạt 75% để nhận chứng chỉ.', resources: [],
      exercise: exercise('ex_c1final', 'Bài kiểm tra cuối: Gestalt Principles', 'Kiểm tra toàn diện tất cả nguyên tắc Gestalt và ứng dụng vào thiết kế UX/UI.', 20, 75, [
        q('qf1', 'single', 'Một nhóm icon trên thanh toolbar có cùng màu và kích thước. Nguyên tắc nào nhóm chúng lại?', ['Proximity', 'Similarity', 'Common Region', 'Closure'], 'Similarity', 'Similarity – các phần tử giống nhau về màu và kích thước được nhóm lại thành một nhóm chức năng.'),
        q('qf2', 'multiple', 'Nguyên tắc nào sau đây TRỰC TIẾP liên quan đến thiết kế form? (Chọn 2)', ['Proximity', 'Similarity', 'Common Fate', 'Closure'], ['Proximity', 'Similarity'], 'Proximity đặt label gần field; Similarity dùng màu/kiểu dáng đồng nhất cho các required fields.'),
        q('qf3', 'true_false', 'Nguyên tắc Prägnanz (Good Gestalt) khuyến khích designer tạo ra giao diện phức tạp để hiển thị chuyên môn.', ['Đúng', 'Sai'], 'Sai', 'Hoàn toàn ngược lại – Prägnanz khuyến khích simplicity. Não người luôn ưu tiên cách giải thích đơn giản nhất có thể.'),
        q('qf4', 'single', 'Progress stepper (Bước 1 → Bước 2 → Bước 3) trong checkout flow sử dụng nguyên tắc nào chính?', ['Similarity', 'Closure', 'Continuity', 'Common Region'], 'Continuity', 'Continuity – mũi tên và đường kẻ liên tục dẫn mắt người dùng từ bước này sang bước kia.'),
        q('qf5', 'single', 'Notification badge (chấm đỏ trên icon) sử dụng nguyên tắc nào để "gắn" thông báo với icon đó?', ['Similarity', 'Proximity', 'Connectedness', 'Closure'], 'Proximity', 'Proximity – badge được đặt ngay cạnh icon, gần đến mức não tự hiểu chúng thuộc về nhau.'),
      ]) },
  ],
};

// ─── Course 2 – Input Controls ────────────────────────────────────────────────

const c2s1: CourseSection = {
  id: 'c2s1', courseId: '2', order: 1,
  title: 'Giới thiệu về các điều khiển đầu vào',
  lessons: [
    { id: 'c2s1l1', sectionId: 'c2s1', courseId: '2', order: 1, title: 'Tổng quan các loại Input Controls', type: 'video', duration: '07:30', isPreview: true, description: 'Phân loại và giới thiệu toàn bộ các loại input controls: text, select, number, special. Khi nào dùng loại nào?', resources: [] },
    { id: 'c2s1l2', sectionId: 'c2s1', courseId: '2', order: 2, title: 'Nguyên tắc vàng trong thiết kế Form', type: 'video', duration: '09:15', isPreview: true, description: '5 nguyên tắc vàng giúp form của bạn dễ điền, ít lỗi và tăng conversion rate.', resources: [{ id: 'r8', title: 'Form Design Best Practices', type: 'pdf', url: '#', size: '1.5 MB' }] },
    { id: 'c2s1l3', sectionId: 'c2s1', courseId: '2', order: 3, title: '🧪 Quiz: Input Controls Basics', type: 'quiz', duration: '8 phút', isPreview: false, description: 'Kiểm tra kiến thức cơ bản về input controls.', resources: [],
      exercise: exercise('ex_c2s1', 'Quiz: Cơ bản về Input Controls', 'Kiểm tra kiến thức về phân loại và sử dụng input controls.', 8, 60, [
        q('c2q1', 'single', 'Khi cần người dùng chọn MỘT trong nhiều lựa chọn rời nhau, nên dùng gì?', ['Checkbox', 'Radio Button', 'Toggle Switch', 'Dropdown'], 'Radio Button', 'Radio button cho phép chọn một trong nhiều lựa chọn mutually exclusive, rất rõ ràng khi có ít lựa chọn (2-5).'),
        q('c2q2', 'single', 'Khi có hơn 7 lựa chọn, nên dùng gì thay vì radio buttons?', ['Checkboxes', 'Dropdown/Select', 'Toggle', 'Slider'], 'Dropdown/Select', 'Khi có nhiều hơn 5-7 lựa chọn, dropdown tiết kiệm không gian hơn radio buttons.'),
        q('c2q3', 'true_false', 'Toggle switch phù hợp hơn checkbox khi hành động có hiệu lực ngay lập tức (immediate effect).', ['Đúng', 'Sai'], 'Đúng', 'Toggle phù hợp với on/off immediate actions (bật tắt thông báo); checkbox phù hợp với form submission.'),
        q('c2q4', 'multiple', 'Label của input field nên làm những gì? (Chọn tất cả đúng)', ['Ngắn gọn và rõ ràng', 'Luôn đặt bên trong placeholder', 'Luôn hiển thị (không biến mất)', 'Mô tả rõ dữ liệu cần nhập'], ['Ngắn gọn và rõ ràng', 'Luôn hiển thị (không biến mất)', 'Mô tả rõ dữ liệu cần nhập'], 'Label nên luôn hiển thị (không chỉ dùng placeholder làm label vì sẽ biến mất khi user bắt đầu nhập).'),
      ]) },
  ],
};

const c2s2: CourseSection = {
  id: 'c2s2', courseId: '2', order: 2,
  title: 'Ô nhập văn bản',
  lessons: [
    { id: 'c2s2l1', sectionId: 'c2s2', courseId: '2', order: 1, title: 'Text Input: Anatomy & States', type: 'video', duration: '11:00', isPreview: false, description: 'Phân tích cấu trúc text input: label, placeholder, helper text, error state, focus state, disabled state.', resources: [] },
    { id: 'c2s2l2', sectionId: 'c2s2', courseId: '2', order: 2, title: 'Textarea và Rich Text Editor', type: 'video', duration: '08:20', isPreview: false, description: 'Khi nào dùng textarea? Cách thiết kế textarea với auto-resize, character count và rich text toolbar.', resources: [] },
    { id: 'c2s2l3', sectionId: 'c2s2', courseId: '2', order: 3, title: 'Search Input và Autocomplete', type: 'video', duration: '12:45', isPreview: false, description: 'Thiết kế search input hiệu quả: instant search, autocomplete, search history và advanced filters.', resources: [] },
    { id: 'c2s2l4', sectionId: 'c2s2', courseId: '2', order: 4, title: '🧪 Quiz: Text Inputs', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Kiểm tra về text input và trạng thái của chúng.', resources: [],
      exercise: exercise('ex_c2s2', 'Quiz: Text Input Design', 'Kiểm tra về thiết kế text input và các best practices.', 10, 60, [
        q('c2q5', 'single', 'Placeholder text trong input field nên dùng để làm gì?', ['Thay thế label', 'Cho ví dụ về định dạng dữ liệu', 'Hiển thị thông báo lỗi', 'Không bao giờ nên dùng'], 'Cho ví dụ về định dạng dữ liệu', 'Placeholder nên cho ví dụ (ví dụ: "dd/mm/yyyy"), không nên thay thế label vì sẽ biến mất khi user nhập.'),
        q('c2q6', 'true_false', 'Input field nên luôn hiển thị trạng thái lỗi ngay khi user bắt đầu nhập.', ['Đúng', 'Sai'], 'Sai', 'Lỗi nên hiển thị sau khi user rời khỏi field (blur) hoặc khi submit form, không phải khi đang nhập.'),
        q('c2q7', 'single', 'Character count trong textarea nên hiển thị ở đâu?', ['Bên trái dưới textarea', 'Bên phải dưới textarea', 'Bên trong textarea (overlay)', 'Không cần hiển thị'], 'Bên phải dưới textarea', 'Character count ở góc phải phía dưới theo convention phổ biến nhất, giúp user thấy ngay còn bao nhiêu ký tự.'),
      ]) },
  ],
};

const c2s3: CourseSection = {
  id: 'c2s3', courseId: '2', order: 3,
  title: 'Đầu vào lựa chọn',
  lessons: [
    { id: 'c2s3l1', sectionId: 'c2s3', courseId: '2', order: 1, title: 'Radio Buttons vs Checkboxes – Khi nào dùng gì?', type: 'video', duration: '10:30', isPreview: false, description: 'So sánh chi tiết radio buttons và checkboxes: use cases, accessibility, và cách nhóm chúng.', resources: [] },
    { id: 'c2s3l2', sectionId: 'c2s3', courseId: '2', order: 2, title: 'Dropdown và Select Menu', type: 'video', duration: '13:15', isPreview: false, description: 'Native select vs custom dropdown, multi-select, searchable dropdown, và grouped options.', resources: [] },
    { id: 'c2s3l3', sectionId: 'c2s3', courseId: '2', order: 3, title: 'Toggle Switch và Chip', type: 'video', duration: '09:00', isPreview: false, description: 'Thiết kế toggle switch cho settings, và chip component cho filtering.', resources: [] },
    { id: 'c2s3l4', sectionId: 'c2s3', courseId: '2', order: 4, title: '🧪 Quiz: Selection Inputs', type: 'quiz', duration: '12 phút', isPreview: false, description: 'Kiểm tra về lựa chọn đúng loại selection input.', resources: [],
      exercise: exercise('ex_c2s3', 'Quiz: Selection Input Design', 'Chọn đúng input type cho từng use case cụ thể.', 12, 65, [
        q('c2q8', 'single', 'Form chọn giới tính (Nam/Nữ/Khác) nên dùng gì?', ['Dropdown', 'Checkbox', 'Radio Button', 'Toggle'], 'Radio Button', '3 lựa chọn rõ ràng, mutually exclusive → Radio button là lựa chọn tốt nhất cho visibility.'),
        q('c2q9', 'single', 'Form đặt pizza với topping (chọn nhiều): pepperoni, mushroom, onion... Nên dùng gì?', ['Radio Button', 'Dropdown', 'Checkbox', 'Toggle'], 'Checkbox', 'Checkbox cho phép chọn nhiều lựa chọn cùng lúc – phù hợp với multi-select topping.'),
        q('c2q10', 'single', 'Settings "Bật thông báo email" nên dùng gì?', ['Checkbox', 'Radio Button', 'Toggle Switch', 'Dropdown'], 'Toggle Switch', 'Toggle switch cho on/off settings có immediate effect – người dùng thấy ngay trạng thái bật/tắt.'),
        q('c2q11', 'true_false', 'Custom dropdown đẹp hơn native select, do đó luôn nên dùng custom dropdown.', ['Đúng', 'Sai'], 'Sai', 'Native select có accessibility tốt hơn và hoạt động tốt trên mobile. Custom dropdown chỉ nên dùng khi cần custom features mà native không hỗ trợ.'),
      ]) },
  ],
};

// ─── Course 3 – Microcopy ────────────────────────────────────────────────────

const c3s1: CourseSection = {
  id: 'c3s1', courseId: '3', order: 1,
  title: 'Giới thiệu Microcopy',
  lessons: [
    { id: 'c3s1l1', sectionId: 'c3s1', courseId: '3', order: 1, title: 'Microcopy là gì và tại sao quan trọng?', type: 'video', duration: '08:00', isPreview: true, description: 'Microcopy là những đoạn văn bản ngắn trong giao diện: button labels, error messages, tooltips. Tại sao chúng quyết định UX?', resources: [] },
    { id: 'c3s1l2', sectionId: 'c3s1', courseId: '3', order: 2, title: 'Khung 3C: Clarity, Conciseness, Character', type: 'video', duration: '11:20', isPreview: false, description: 'Ba mục tiêu cốt lõi của microcopy tốt: rõ ràng, ngắn gọn, và có cá tính.', resources: [] },
    { id: 'c3s1l3', sectionId: 'c3s1', courseId: '3', order: 3, title: '🧪 Quiz: Microcopy Fundamentals', type: 'quiz', duration: '8 phút', isPreview: false, description: 'Kiểm tra kiến thức cơ bản về microcopy.', resources: [],
      exercise: exercise('ex_c3s1', 'Quiz: Nền tảng Microcopy', 'Kiểm tra hiểu biết về khái niệm và tầm quan trọng của microcopy.', 8, 60, [
        q('c3q1', 'single', 'Đâu là ví dụ về microcopy?', ['Bài viết blog 1000 chữ', 'Thông báo lỗi "Mật khẩu không đúng"', 'Landing page copy', 'Email marketing'], 'Thông báo lỗi "Mật khẩu không đúng"', 'Microcopy là các đoạn văn bản ngắn trong UI như error messages, button labels, tooltips, placeholder text.'),
        q('c3q2', 'true_false', 'Microcopy tốt luôn phải dài để giải thích đầy đủ.', ['Đúng', 'Sai'], 'Sai', 'Microcopy tốt phải Concise (ngắn gọn) – giải thích đủ ý trong ít chữ nhất có thể.'),
        q('c3q3', 'single', '"Character" trong khung 3C có nghĩa là gì?', ['Số lượng ký tự', 'Cá tính/giọng văn của brand', 'Phông chữ được dùng', 'Màu sắc của text'], 'Cá tính/giọng văn của brand', 'Character là tính cách, giọng điệu của thương hiệu thể hiện qua cách dùng từ – formal, friendly, playful...'),
      ]) },
  ],
};

const c3s2: CourseSection = {
  id: 'c3s2', courseId: '3', order: 2,
  title: 'Mục tiêu 1: Sự rõ ràng (Clarity)',
  lessons: [
    { id: 'c3s2l1', sectionId: 'c3s2', courseId: '3', order: 1, title: 'Viết để người dùng hiểu ngay', type: 'video', duration: '12:30', isPreview: false, description: 'Kỹ thuật viết microcopy rõ ràng: dùng ngôn ngữ người dùng (không phải jargon), active voice, và cụ thể.', resources: [] },
    { id: 'c3s2l2', sectionId: 'c3s2', courseId: '3', order: 2, title: 'Error Messages hiệu quả', type: 'video', duration: '14:00', isPreview: false, description: 'Cách viết error message không làm người dùng bực bội: specific, actionable, và không blame the user.', resources: [{ id: 'r9', title: 'Error Message Templates', type: 'pdf', url: '#', size: '0.8 MB' }] },
    { id: 'c3s2l3', sectionId: 'c3s2', courseId: '3', order: 3, title: '🧪 Quiz: Clarity in Microcopy', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Thực hành cải thiện microcopy mờ nhạt thành rõ ràng.', resources: [],
      exercise: exercise('ex_c3s2', 'Quiz: Viết Microcopy Rõ Ràng', 'Cải thiện các đoạn microcopy mờ nhạt.', 10, 65, [
        q('c3q4', 'single', 'Error message nào tốt hơn khi user nhập email sai định dạng?', ['"Lỗi"', '"Dữ liệu không hợp lệ"', '"Email phải có định dạng example@domain.com"', '"Có gì đó sai sai, thử lại đi"'], '"Email phải có định dạng example@domain.com"', 'Error message tốt là specific (chỉ rõ vấn đề) và actionable (hướng dẫn cách sửa).'),
        q('c3q5', 'single', 'Button label nào rõ ràng hơn cho hành động thanh toán?', ['"Submit"', '"OK"', '"Xác nhận thanh toán 599.000đ"', '"Next"'], '"Xác nhận thanh toán 599.000đ"', 'Button label tốt phải mô tả chính xác hành động sẽ xảy ra, kể cả hậu quả (số tiền sẽ bị trừ).'),
        q('c3q6', 'true_false', 'Dùng "Bấm vào đây để tiếp tục" là một button label tốt.', ['Đúng', 'Sai'], 'Sai', '"Bấm vào đây" là microcopy kém – không mô tả hành động sẽ xảy ra. Nên thay bằng "Tiếp tục đặt hàng" hoặc cụ thể hơn.'),
      ]) },
  ],
};

const c3s3: CourseSection = {
  id: 'c3s3', courseId: '3', order: 3,
  title: 'Mục tiêu 2: Sự ngắn gọn (Conciseness)',
  lessons: [
    { id: 'c3s3l1', sectionId: 'c3s3', courseId: '3', order: 1, title: 'Cắt bỏ từ thừa không mất ý nghĩa', type: 'video', duration: '10:45', isPreview: false, description: 'Kỹ thuật rút gọn microcopy: loại bỏ filler words, passive voice, và redundancy.', resources: [] },
    { id: 'c3s3l2', sectionId: 'c3s3', courseId: '3', order: 2, title: 'Tooltip và Helper Text hiệu quả', type: 'video', duration: '09:30', isPreview: false, description: 'Khi nào cần tooltip? Cách viết helper text ngắn gọn nhưng đủ thông tin.', resources: [] },
    { id: 'c3s3l3', sectionId: 'c3s3', courseId: '3', order: 3, title: '🧪 Bài tập thực hành: Rút gọn Microcopy', type: 'quiz', duration: '12 phút', isPreview: false, description: 'Rút gọn các đoạn microcopy dài dòng.', resources: [],
      exercise: exercise('ex_c3s3', 'Bài tập: Rút gọn Microcopy', 'Rút gọn các đoạn microcopy dài dòng mà không mất đi ý nghĩa.', 12, 65, [
        q('c3q7', 'single', '"Vui lòng điền vào trường này vì nó là bắt buộc và không thể để trống." Rút gọn thành gì?', ['"Điền vào"', '"Bắt buộc"', '"Không để trống"', '"Field bắt buộc"'], '"Field bắt buộc"', '"Field bắt buộc" (hoặc dấu * đỏ) truyền đạt cùng ý nghĩa trong 2 từ thay vì 14 từ.'),
        q('c3q8', 'true_false', 'Đôi khi nên dùng nhiều chữ hơn để nhấn mạnh sự quan trọng của thông tin.', ['Đúng', 'Sai'], 'Đúng', 'Đúng – một số trường hợp như cảnh báo xóa dữ liệu quan trọng, nên giải thích đầy đủ hậu quả.'),
      ]) },
  ],
};

// ─── Course 4 – Demonstrating UX Value ───────────────────────────────────────

const c4s1: CourseSection = {
  id: 'c4s1', courseId: '4', order: 1,
  title: 'Xác định giá trị UX',
  lessons: [
    { id: 'c4s1l1', sectionId: 'c4s1', courseId: '4', order: 1, title: 'UX tạo ra giá trị kinh doanh thế nào?', type: 'video', duration: '09:00', isPreview: true, description: 'UX không chỉ là "làm cho đẹp" – đây là công cụ tạo ra ROI thực sự. Các case studies từ Amazon, Google, Apple.', resources: [] },
    { id: 'c4s1l2', sectionId: 'c4s1', courseId: '4', order: 2, title: 'Xây dựng Business Case cho UX', type: 'video', duration: '13:00', isPreview: false, description: 'Cách thuyết phục stakeholders đầu tư vào UX bằng ngôn ngữ kinh doanh: ROI, KPI, OKR.', resources: [] },
    { id: 'c4s1l3', sectionId: 'c4s1', courseId: '4', order: 3, title: '🧪 Quiz: UX Business Value', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Kiểm tra về cách đo lường và truyền đạt giá trị UX.', resources: [],
      exercise: exercise('ex_c4s1', 'Quiz: Giá trị UX', 'Kiểm tra hiểu biết về business case cho UX.', 10, 60, [
        q('c4q1', 'single', 'ROI của UX thường được đo bằng cách nào trực tiếp nhất?', ['Số lượng màu sắc trong thiết kế', 'Tăng conversion rate và giảm support costs', 'Số lượng features được thiết kế', 'Điểm đẹp từ designer'], 'Tăng conversion rate và giảm support costs', 'ROI của UX đo được qua: tăng doanh thu (conversion), giảm chi phí (support, training), tăng retention.'),
        q('c4q2', 'true_false', 'UX Designer không cần quan tâm đến business metrics – đó là việc của product manager.', ['Đúng', 'Sai'], 'Sai', 'UX Designer giỏi phải hiểu business metrics để thiết kế trải nghiệm phục vụ cả người dùng lẫn business goals.'),
      ]) },
  ],
};

const c4s2: CourseSection = {
  id: 'c4s2', courseId: '4', order: 2,
  title: 'Đo lường giá trị UX',
  lessons: [
    { id: 'c4s2l1', sectionId: 'c4s2', courseId: '4', order: 1, title: 'UX Metrics: NPS, CSAT, SUS, CES', type: 'video', duration: '14:30', isPreview: false, description: 'Giới thiệu các metrics đo lường UX phổ biến: NPS, CSAT, SUS (System Usability Scale), CES.', resources: [] },
    { id: 'c4s2l2', sectionId: 'c4s2', courseId: '4', order: 2, title: 'HEART Framework của Google', type: 'video', duration: '11:00', isPreview: false, description: 'Happiness, Engagement, Adoption, Retention, Task Success – framework toàn diện đo UX.', resources: [] },
    { id: 'c4s2l3', sectionId: 'c4s2', courseId: '4', order: 3, title: '🧪 Quiz: UX Metrics', type: 'quiz', duration: '12 phút', isPreview: false, description: 'Kiểm tra về các frameworks và metrics đo lường UX.', resources: [],
      exercise: exercise('ex_c4s2', 'Quiz: Đo lường UX', 'Kiểm tra về UX metrics và HEART framework.', 12, 65, [
        q('c4q3', 'single', 'SUS (System Usability Scale) cho điểm 68 nghĩa là gì?', ['Rất tệ', 'Trung bình', 'Tốt (Above average)', 'Xuất sắc'], 'Trung bình', 'SUS 68 = D (average/marginal). Điểm tốt là >70 (B). Xuất sắc là >85 (A).'),
        q('c4q4', 'single', 'Trong HEART framework, "T" là gì?', ['Time on task', 'Task Success', 'Total users', 'Touchpoint'], 'Task Success', 'T = Task Success – tỷ lệ người dùng hoàn thành task thành công, tốc độ và tỷ lệ lỗi.'),
        q('c4q5', 'true_false', 'NPS (Net Promoter Score) đo lường trực tiếp usability của sản phẩm.', ['Đúng', 'Sai'], 'Sai', 'NPS đo loyalty và khả năng người dùng giới thiệu sản phẩm, không đo usability trực tiếp.'),
      ]) },
  ],
};

const c4s3: CourseSection = {
  id: 'c4s3', courseId: '4', order: 3,
  title: 'Trình bày tác động đến các bên liên quan',
  lessons: [
    { id: 'c4s3l1', sectionId: 'c4s3', courseId: '4', order: 1, title: 'Storytelling với Data UX', type: 'video', duration: '12:00', isPreview: false, description: 'Cách trình bày kết quả UX research với stakeholders bằng data visualization và storytelling.', resources: [] },
    { id: 'c4s3l2', sectionId: 'c4s3', courseId: '4', order: 2, title: 'UX Dashboard cho Leadership', type: 'video', duration: '15:30', isPreview: false, description: 'Xây dựng UX dashboard cho leadership: chọn metrics đúng, visualize data, và executive summary.', resources: [] },
    { id: 'c4s3l3', sectionId: 'c4s3', courseId: '4', order: 3, title: '🧪 Bài tập cuối: UX Value Report', type: 'quiz', duration: '15 phút', isPreview: false, description: 'Bài tập tổng hợp: phân tích tình huống và đề xuất metrics phù hợp.', resources: [],
      exercise: exercise('ex_c4s3', 'Bài tập: UX Value Report', 'Phân tích tình huống thực tế và đề xuất UX metrics phù hợp.', 15, 70, [
        q('c4q6', 'single', 'CEO muốn biết UX ảnh hưởng đến doanh thu thế nào. Metrics nào nên trình bày đầu tiên?', ['SUS score', 'Số bug được fix', 'Conversion rate change', 'Thời gian thiết kế'], 'Conversion rate change', 'CEO quan tâm đến business outcome – conversion rate change thể hiện trực tiếp tác động đến doanh thu.'),
        q('c4q7', 'multiple', 'UX Research report cho product team nên bao gồm gì? (Chọn tất cả đúng)', ['Key insights từ user interviews', 'Recommendations có thể action được', 'Chi tiết kỹ thuật backend', 'Priority matrix'], ['Key insights từ user interviews', 'Recommendations có thể action được', 'Priority matrix'], 'Report cho product team cần insights thực tế, gợi ý actionable, và priority matrix để họ biết làm gì trước.'),
      ]) },
  ],
};

// ─── Course 5 – 10 Heuristics ─────────────────────────────────────────────────

const c5s1: CourseSection = {
  id: 'c5s1', courseId: '5', order: 1,
  title: 'Giới thiệu về Heuristic Evaluation',
  lessons: [
    { id: 'c5s1l1', sectionId: 'c5s1', courseId: '5', order: 1, title: 'Heuristic Evaluation là gì?', type: 'video', duration: '10:00', isPreview: true, description: 'Giới thiệu phương pháp Heuristic Evaluation: so sánh với usability testing, khi nào dùng, ai thực hiện.', resources: [] },
    { id: 'c5s1l2', sectionId: 'c5s1', courseId: '5', order: 2, title: 'Jakob Nielsen và 10 Heuristics', type: 'video', duration: '08:30', isPreview: true, description: 'Tổng quan 10 nguyên tắc heuristic của Jakob Nielsen – "10 commandments" của usability.', resources: [] },
    { id: 'c5s1l3', sectionId: 'c5s1', courseId: '5', order: 3, title: 'Severity Rating System', type: 'video', duration: '07:15', isPreview: false, description: 'Cách đánh giá mức độ nghiêm trọng của vấn đề usability từ 0 (không phải vấn đề) đến 4 (catastrophic).', resources: [] },
    { id: 'c5s1l4', sectionId: 'c5s1', courseId: '5', order: 4, title: '🧪 Quiz: Heuristic Evaluation Basics', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Kiểm tra kiến thức về phương pháp Heuristic Evaluation.', resources: [],
      exercise: exercise('ex_c5s1', 'Quiz: Nền tảng Heuristic Evaluation', 'Kiểm tra hiểu biết về heuristic evaluation methodology.', 10, 60, [
        q('c5q1', 'single', 'Heuristic Evaluation thường được thực hiện bởi ai?', ['Người dùng thực tế', 'Usability experts (2-5 người)', 'CEO của công ty', 'Developer'], 'Usability experts (2-5 người)', 'Heuristic Evaluation hiệu quả nhất khi có 3-5 evaluators độc lập, sau đó tổng hợp kết quả.'),
        q('c5q2', 'single', 'Severity 4 trong heuristic evaluation là gì?', ['Cosmetic issue', 'Minor usability problem', 'Major usability problem', 'Usability catastrophe'], 'Usability catastrophe', 'Severity 4 = Usability catastrophe – phải fix trước khi release. Người dùng không thể hoàn thành task.'),
        q('c5q3', 'true_false', 'Heuristic Evaluation có thể thay thế hoàn toàn user testing.', ['Đúng', 'Sai'], 'Sai', 'Heuristic Evaluation tìm ra nhiều vấn đề usability nhanh và rẻ, nhưng không thể thay thế hoàn toàn user testing với người dùng thực.'),
      ]) },
  ],
};

const c5s2: CourseSection = {
  id: 'c5s2', courseId: '5', order: 2,
  title: 'Visibility và Feedback (H1, H3)',
  lessons: [
    { id: 'c5s2l1', sectionId: 'c5s2', courseId: '5', order: 1, title: 'H1: Visibility of System Status', type: 'video', duration: '13:00', isPreview: false, description: 'Heuristic #1: Hệ thống luôn phải thông báo cho người dùng về trạng thái của nó. Loading states, progress indicators, feedback messages.', resources: [] },
    { id: 'c5s2l2', sectionId: 'c5s2', courseId: '5', order: 2, title: 'H3: User Control and Freedom', type: 'video', duration: '11:45', isPreview: false, description: 'Heuristic #3: Người dùng cần "emergency exits" – undo, redo, cancel. Cách thiết kế safe exploration.', resources: [] },
    { id: 'c5s2l3', sectionId: 'c5s2', courseId: '5', order: 3, title: '🧪 Quiz: H1 & H3 Application', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Áp dụng Heuristic 1 và 3 vào các tình huống thiết kế.', resources: [],
      exercise: exercise('ex_c5s2', 'Quiz: H1 & H3 trong thực tế', 'Nhận diện vi phạm và đề xuất giải pháp cho H1, H3.', 10, 65, [
        q('c5q4', 'single', 'Upload ảnh không có loading indicator vi phạm heuristic nào?', ['H2: Match real world', 'H1: Visibility of system status', 'H4: Consistency', 'H9: Error recovery'], 'H1: Visibility of system status', 'Không có loading indicator → người dùng không biết hệ thống đang xử lý → vi phạm H1.'),
        q('c5q5', 'single', 'Không có nút "Undo" sau khi xóa email vi phạm heuristic nào?', ['H1', 'H3: User control and freedom', 'H5: Error prevention', 'H7: Flexibility'], 'H3: User control and freedom', 'Thiếu Undo/Cancel là vi phạm H3 – người dùng cần cảm thấy có thể "thoát ra" khi làm sai.'),
        q('c5q6', 'true_false', 'Skeleton loading screen là ví dụ tốt của Heuristic #1.', ['Đúng', 'Sai'], 'Đúng', 'Skeleton loading hiển thị trạng thái "đang tải" một cách trực quan, giúp người dùng biết nội dung sắp xuất hiện.'),
      ]) },
  ],
};

const c5s3: CourseSection = {
  id: 'c5s3', courseId: '5', order: 3,
  title: 'Error Prevention và Recognition',
  lessons: [
    { id: 'c5s3l1', sectionId: 'c5s3', courseId: '5', order: 1, title: 'H5: Error Prevention', type: 'video', duration: '12:30', isPreview: false, description: 'Ngăn chặn lỗi trước khi chúng xảy ra: confirmation dialogs, inline validation, constraints.', resources: [] },
    { id: 'c5s3l2', sectionId: 'c5s3', courseId: '5', order: 2, title: 'H6: Recognition over Recall', type: 'video', duration: '10:00', isPreview: false, description: 'Hiển thị options thay vì bắt người dùng phải nhớ. Icons vs text labels, search autocomplete, recently used.', resources: [] },
    { id: 'c5s3l3', sectionId: 'c5s3', courseId: '5', order: 3, title: '🧪 Bài tập: Heuristic Audit', type: 'quiz', duration: '15 phút', isPreview: false, description: 'Thực hiện heuristic audit mini cho một app UI.', resources: [],
      exercise: exercise('ex_c5s3', 'Bài tập: Heuristic Audit', 'Phân tích UI và nhận diện các vi phạm heuristics.', 15, 70, [
        q('c5q7', 'single', 'Form không cho phép nhập ngày sinh trong tương lai là ví dụ của heuristic nào?', ['H1', 'H3', 'H5: Error prevention', 'H8'], 'H5: Error prevention', 'Constraint validation (chặn input không hợp lệ) là ứng dụng tốt của H5 – ngăn lỗi trước khi submit.'),
        q('c5q8', 'single', 'Dropdown gợi ý lịch sử tìm kiếm là ví dụ của heuristic nào?', ['H5', 'H6: Recognition over recall', 'H7', 'H9'], 'H6: Recognition over recall', 'Hiển thị lịch sử tìm kiếm giúp người dùng recognize thay vì phải recall – đây là H6.'),
        q('c5q9', 'multiple', 'Confirmation dialog "Bạn có chắc muốn xóa?" áp dụng heuristics nào? (Chọn 2)', ['H5: Error prevention', 'H3: User control', 'H1: Visibility', 'H4: Consistency'], ['H5: Error prevention', 'H3: User control'], 'Confirmation dialog vừa ngăn lỗi (H5) vừa cho user quyền kiểm soát quyết định (H3).'),
      ]) },
  ],
};

// ─── Course 6 – User Research ─────────────────────────────────────────────────

const c6s1: CourseSection = {
  id: 'c6s1', courseId: '6', order: 1,
  title: 'Tổng quan về nghiên cứu người dùng',
  lessons: [
    { id: 'c6s1l1', sectionId: 'c6s1', courseId: '6', order: 1, title: 'Tại sao cần User Research?', type: 'video', duration: '09:00', isPreview: true, description: 'Research-driven design vs assumption-driven design. Case studies về thất bại do bỏ qua user research.', resources: [] },
    { id: 'c6s1l2', sectionId: 'c6s1', courseId: '6', order: 2, title: 'Phân loại phương pháp Research', type: 'video', duration: '12:00', isPreview: false, description: 'Matrix 2x2: Attitudinal/Behavioral × Qualitative/Quantitative. Khi nào dùng phương pháp nào?', resources: [] },
    { id: 'c6s1l3', sectionId: 'c6s1', courseId: '6', order: 3, title: '🧪 Quiz: Research Methods Overview', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Kiểm tra về phân loại phương pháp nghiên cứu.', resources: [],
      exercise: exercise('ex_c6s1', 'Quiz: Phân loại Research Methods', 'Kiểm tra hiểu biết về các phương pháp nghiên cứu.', 10, 60, [
        q('c6q1', 'single', 'User interview thuộc loại nghiên cứu nào?', ['Quantitative + Behavioral', 'Qualitative + Attitudinal', 'Quantitative + Attitudinal', 'Qualitative + Behavioral'], 'Qualitative + Attitudinal', 'Interview thu thập ý kiến, cảm nhận của người dùng → Qualitative (không phải số) và Attitudinal (thái độ).'),
        q('c6q2', 'single', 'A/B testing thuộc loại nghiên cứu nào?', ['Qualitative + Attitudinal', 'Qualitative + Behavioral', 'Quantitative + Behavioral', 'Quantitative + Attitudinal'], 'Quantitative + Behavioral', 'A/B testing đo lường hành vi thực tế (behavioral) của nhiều người dùng → Quantitative + Behavioral.'),
        q('c6q3', 'true_false', 'Focus group là phương pháp tốt nhất để quan sát hành vi thực tế của người dùng.', ['Đúng', 'Sai'], 'Sai', 'Focus group là attitudinal – người dùng nói những gì họ nghĩ. Để quan sát hành vi thực, cần dùng usability testing hoặc field study.'),
      ]) },
  ],
};

const c6s2: CourseSection = {
  id: 'c6s2', courseId: '6', order: 2,
  title: 'Phương pháp định tính',
  lessons: [
    { id: 'c6s2l1', sectionId: 'c6s2', courseId: '6', order: 1, title: 'User Interviews: Kỹ thuật phỏng vấn', type: 'video', duration: '15:00', isPreview: false, description: 'Cách thiết kế discussion guide, đặt câu hỏi mở, active listening, và tránh leading questions.', resources: [{ id: 'r10', title: 'Interview Discussion Guide Template', type: 'pdf', url: '#', size: '0.6 MB' }] },
    { id: 'c6s2l2', sectionId: 'c6s2', courseId: '6', order: 2, title: 'Usability Testing: Remote & In-person', type: 'video', duration: '13:30', isPreview: false, description: 'Tổ chức usability test: recruit, script, moderated vs unmoderated, tools (Maze, UserTesting).', resources: [] },
    { id: 'c6s2l3', sectionId: 'c6s2', courseId: '6', order: 3, title: 'Card Sorting và Tree Testing', type: 'video', duration: '11:00', isPreview: false, description: 'Dùng Card Sorting để thiết kế IA, và Tree Testing để validate navigation structure.', resources: [] },
    { id: 'c6s2l4', sectionId: 'c6s2', courseId: '6', order: 4, title: '🧪 Quiz: Qualitative Methods', type: 'quiz', duration: '12 phút', isPreview: false, description: 'Kiểm tra về phương pháp nghiên cứu định tính.', resources: [],
      exercise: exercise('ex_c6s2', 'Quiz: Phương pháp Định tính', 'Kiểm tra về user interviews, usability testing và IA research.', 12, 65, [
        q('c6q4', 'single', 'Câu hỏi phỏng vấn nào là "leading question" (cần tránh)?', ['"Bạn thường mua sắm online thế nào?"', '"Bạn thấy nút này có khó tìm không?"', '"Khi cần đặt hàng, bạn làm gì đầu tiên?"', '"Hãy kể về lần cuối bạn dùng app này?"'], '"Bạn thấy nút này có khó tìm không?"', '"Khó tìm không?" gợi ý câu trả lời mong muốn – đây là leading question. Cần hỏi trung lập hơn: "Bạn cảm thấy thế nào về nút này?"'),
        q('c6q5', 'single', 'Unmoderated usability testing có ưu điểm gì so với moderated?', ['Chất lượng insight cao hơn', 'Scale được lên nhiều participants', 'Không cần tool đặc biệt', 'Rẻ hơn để setup'], 'Scale được lên nhiều participants', 'Unmoderated testing có thể chạy song song với nhiều participants, tiết kiệm thời gian và scale tốt hơn.'),
      ]) },
  ],
};

const c6s3: CourseSection = {
  id: 'c6s3', courseId: '6', order: 3,
  title: 'Phân tích và tổng hợp Research',
  lessons: [
    { id: 'c6s3l1', sectionId: 'c6s3', courseId: '6', order: 1, title: 'Affinity Diagram và Thematic Analysis', type: 'video', duration: '13:00', isPreview: false, description: 'Cách tổng hợp dữ liệu định tính: affinity mapping, coding, theme extraction.', resources: [] },
    { id: 'c6s3l2', sectionId: 'c6s3', courseId: '6', order: 2, title: 'Tạo Personas và Journey Maps', type: 'video', duration: '16:00', isPreview: false, description: 'Từ research data đến personas thực tế và customer journey map có thể dùng được.', resources: [{ id: 'r11', title: 'Persona Template (Figma)', type: 'link', url: '#' }] },
    { id: 'c6s3l3', sectionId: 'c6s3', courseId: '6', order: 3, title: '🧪 Bài tập: Synthesis từ Interview Notes', type: 'quiz', duration: '15 phút', isPreview: false, description: 'Phân tích và tổng hợp dữ liệu từ phỏng vấn người dùng.', resources: [],
      exercise: exercise('ex_c6s3', 'Bài tập: Synthesis Research Data', 'Phân tích dữ liệu phỏng vấn và tổng hợp insights.', 15, 70, [
        q('c6q6', 'single', 'Persona nên được xây dựng từ đâu?', ['Từ tưởng tượng của designer', 'Từ data user research thực tế', 'Từ yêu cầu của stakeholders', 'Từ competitor analysis'], 'Từ data user research thực tế', 'Personas phải dựa trên real research data – không phải fictional characters. Persona không có research backing gọi là "persona giả tạo".'),
        q('c6q7', 'true_false', 'Journey Map nên bao gồm cả touchpoints với dịch vụ offline không chỉ digital.', ['Đúng', 'Sai'], 'Đúng', 'Customer journey bao gồm mọi điểm tiếp xúc – store, phone, email, website, app. Journey Map phải phản ánh toàn bộ trải nghiệm.'),
        q('c6q8', 'single', 'Khi phân tích phỏng vấn, bạn nên ghi nhận insights theo cấu trúc nào?', ['"Tôi nghĩ người dùng muốn..."', '"Người dùng nói... → Insight là..."', '"Dữ liệu thống kê cho thấy..."', '"CEO muốn feature này vì..."'], '"Người dùng nói... → Insight là..."', 'Tách biệt data (những gì người dùng thực sự nói/làm) khỏi interpretation (insight của researcher) để tránh bias.'),
      ]) },
  ],
};

// ─── Course 7 – Analytics & UX ────────────────────────────────────────────────

const c7s1: CourseSection = {
  id: 'c7s1', courseId: '7', order: 1,
  title: 'Giới thiệu UX Analytics',
  lessons: [
    { id: 'c7s1l1', sectionId: 'c7s1', courseId: '7', order: 1, title: 'Analytics trong UX là gì?', type: 'video', duration: '09:30', isPreview: true, description: 'Kết hợp quantitative analytics với qualitative UX research để có cái nhìn toàn diện về người dùng.', resources: [] },
    { id: 'c7s1l2', sectionId: 'c7s1', courseId: '7', order: 2, title: 'Google Analytics 4 cho UX Designer', type: 'video', duration: '14:00', isPreview: false, description: 'Các reports và metrics quan trọng trong GA4 cho UX: funnel, engagement, user flow.', resources: [] },
    { id: 'c7s1l3', sectionId: 'c7s1', courseId: '7', order: 3, title: '🧪 Quiz: Analytics Fundamentals', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Kiểm tra về các khái niệm analytics cơ bản.', resources: [],
      exercise: exercise('ex_c7s1', 'Quiz: UX Analytics Cơ bản', 'Kiểm tra hiểu biết về analytics tools và metrics.', 10, 60, [
        q('c7q1', 'single', 'Bounce rate cao thường cho thấy điều gì?', ['Trang đang hoạt động tốt', 'Người dùng không tìm thấy nội dung họ cần', 'Site load nhanh', 'Users đang engaged'], 'Người dùng không tìm thấy nội dung họ cần', 'Bounce rate cao = người dùng vào trang rồi rời đi ngay → nội dung không match expectations hoặc UX kém.'),
        q('c7q2', 'single', 'Heatmap thể hiện điều gì?', ['Tốc độ load của trang', 'Nơi người dùng click và nhìn nhiều nhất', 'Số lượng users online', 'Lỗi JavaScript'], 'Nơi người dùng click và nhìn nhiều nhất', 'Heatmap visualize interaction patterns – click map, scroll map, và (với eye tracking) gaze map.'),
      ]) },
  ],
};

const c7s2: CourseSection = {
  id: 'c7s2', courseId: '7', order: 2,
  title: 'Phân tích hành vi người dùng',
  lessons: [
    { id: 'c7s2l1', sectionId: 'c7s2', courseId: '7', order: 1, title: 'Funnel Analysis và Drop-off Points', type: 'video', duration: '13:00', isPreview: false, description: 'Phân tích conversion funnel: tìm drop-off points và đề xuất cải tiến UX dựa trên data.', resources: [] },
    { id: 'c7s2l2', sectionId: 'c7s2', courseId: '7', order: 2, title: 'Session Recording và Heatmaps', type: 'video', duration: '11:30', isPreview: false, description: 'Sử dụng Hotjar, FullStory để record sessions và tạo heatmaps. Cách phân tích để tìm UX issues.', resources: [] },
    { id: 'c7s2l3', sectionId: 'c7s2', courseId: '7', order: 3, title: '🧪 Bài tập: Funnel Analysis', type: 'quiz', duration: '12 phút', isPreview: false, description: 'Phân tích funnel data thực tế và đề xuất cải tiến.', resources: [],
      exercise: exercise('ex_c7s2', 'Bài tập: Funnel Analysis', 'Phân tích funnel và đề xuất cải tiến dựa trên analytics data.', 12, 65, [
        q('c7q3', 'single', 'Checkout funnel: 1000 → 700 → 300 → 200. Bước nào có drop-off lớn nhất cần fix?', ['Bước 1→2 (30% drop)', 'Bước 2→3 (57% drop)', 'Bước 3→4 (33% drop)', 'Tất cả như nhau'], 'Bước 2→3 (57% drop)', 'Bước 2→3 mất 57% users – đây là "leaky bucket" lớn nhất cần ưu tiên investigate và fix.'),
        q('c7q4', 'true_false', 'Session recording có thể vi phạm privacy nếu không có consent từ người dùng.', ['Đúng', 'Sai'], 'Đúng', 'Session recording ghi lại hành vi cá nhân → phải có consent, mask sensitive data (passwords, credit cards), và comply với GDPR/privacy laws.'),
      ]) },
  ],
};

const c7s3: CourseSection = {
  id: 'c7s3', courseId: '7', order: 3,
  title: 'A/B Testing và Experimentation',
  lessons: [
    { id: 'c7s3l1', sectionId: 'c7s3', courseId: '7', order: 1, title: 'Thiết kế A/B Test đúng cách', type: 'video', duration: '14:00', isPreview: false, description: 'Hypothesis, sample size, statistical significance, test duration – những gì cần làm đúng để A/B test có giá trị.', resources: [] },
    { id: 'c7s3l2', sectionId: 'c7s3', courseId: '7', order: 2, title: 'Phân tích kết quả và ra quyết định', type: 'video', duration: '12:00', isPreview: false, description: 'Đọc kết quả A/B test: p-value, confidence interval, và khi nào "không có kết quả" cũng là insight.', resources: [] },
    { id: 'c7s3l3', sectionId: 'c7s3', courseId: '7', order: 3, title: '🧪 Quiz: A/B Testing', type: 'quiz', duration: '12 phút', isPreview: false, description: 'Kiểm tra về thiết kế và phân tích A/B tests.', resources: [],
      exercise: exercise('ex_c7s3', 'Quiz: A/B Testing', 'Kiểm tra về methodology và phân tích A/B testing.', 12, 65, [
        q('c7q5', 'single', 'A/B test đạt "statistical significance" nghĩa là gì?', ['Variant A tốt hơn B', 'Kết quả không phải do ngẫu nhiên với xác suất cao', 'Sample size đủ lớn', 'Test đã chạy đủ lâu'], 'Kết quả không phải do ngẫu nhiên với xác suất cao', 'Statistical significance (thường p < 0.05) có nghĩa là có ≥95% khả năng sự khác biệt là thực sự, không phải ngẫu nhiên.'),
        q('c7q6', 'true_false', 'Nên dừng A/B test ngay khi thấy Variant B đang thắng để tiết kiệm thời gian.', ['Đúng', 'Sai'], 'Sai', '"Peeking" (dừng test sớm khi thấy kết quả tốt) là sai lầm phổ biến. Cần chạy hết thời gian đã định để có kết quả đáng tin cậy.'),
      ]) },
  ],
};

// ─── Course 8 – Design System ────────────────────────────────────────────────

const c8s1: CourseSection = {
  id: 'c8s1', courseId: '8', order: 1,
  title: 'Giới thiệu Design System',
  lessons: [
    { id: 'c8s1l1', sectionId: 'c8s1', courseId: '8', order: 1, title: 'Design System là gì?', type: 'video', duration: '10:00', isPreview: true, description: 'Định nghĩa Design System: không chỉ là component library. Style guide + Component library + Documentation + Governance.', resources: [] },
    { id: 'c8s1l2', sectionId: 'c8s1', courseId: '8', order: 2, title: 'Tại sao cần Design System?', type: 'video', duration: '11:30', isPreview: true, description: 'Business case: giảm inconsistency, tăng tốc development, và cải thiện collaboration. Ví dụ từ Material Design, Carbon, Ant Design.', resources: [] },
    { id: 'c8s1l3', sectionId: 'c8s1', courseId: '8', order: 3, title: 'Design System Maturity Model', type: 'video', duration: '09:15', isPreview: false, description: 'Từ "scattered styles" đến "living design system" – các giai đoạn phát triển của design system.', resources: [] },
    { id: 'c8s1l4', sectionId: 'c8s1', courseId: '8', order: 4, title: '🧪 Quiz: Design System Fundamentals', type: 'quiz', duration: '10 phút', isPreview: false, description: 'Kiểm tra về nền tảng design system.', resources: [],
      exercise: exercise('ex_c8s1', 'Quiz: Nền tảng Design System', 'Kiểm tra hiểu biết về design system concepts.', 10, 60, [
        q('c8q1', 'single', 'Design token là gì?', ['Màu sắc trong Figma', 'Giá trị có thể tái sử dụng (màu, spacing, typography) được đặt tên', 'Component trong code', 'Style guide document'], 'Giá trị có thể tái sử dụng (màu, spacing, typography) được đặt tên', 'Design token là named values (ví dụ: color-primary = #3B82F6) cho phép sync thiết kế và code.'),
        q('c8q2', 'single', 'Component library khác style guide ở điểm nào?', ['Không khác gì', 'Component library chứa code/component; Style guide chứa guidelines', 'Style guide chứa code', 'Component library chỉ dùng cho mobile'], 'Component library chứa code/component; Style guide chứa guidelines', 'Style guide = nguyên tắc và guidelines. Component library = components đã được code sẵn để developer dùng.'),
        q('c8q3', 'true_false', 'Một design system tốt loại bỏ hoàn toàn nhu cầu của designer.', ['Đúng', 'Sai'], 'Sai', 'Design system giải phóng designer khỏi việc tái tạo bánh xe, để họ tập trung vào solving harder design problems.'),
      ]) },
  ],
};

const c8s2: CourseSection = {
  id: 'c8s2', courseId: '8', order: 2,
  title: 'Xây dựng Foundations',
  lessons: [
    { id: 'c8s2l1', sectionId: 'c8s2', courseId: '8', order: 1, title: 'Color System: Palette và Semantic Colors', type: 'video', duration: '14:00', isPreview: false, description: 'Xây dựng color palette: base colors, semantic tokens (primary, secondary, error, warning), dark mode.', resources: [] },
    { id: 'c8s2l2', sectionId: 'c8s2', courseId: '8', order: 2, title: 'Typography System', type: 'video', duration: '12:30', isPreview: false, description: 'Type scale, font weights, line heights, responsive typography. Font pairing và variable fonts.', resources: [] },
    { id: 'c8s2l3', sectionId: 'c8s2', courseId: '8', order: 3, title: 'Spacing, Grid và Layout', type: 'video', duration: '13:15', isPreview: false, description: '8-point grid system, spacing scale, responsive breakpoints, và layout containers.', resources: [{ id: 'r12', title: '8pt Grid System Guide', type: 'pdf', url: '#', size: '1.8 MB' }] },
    { id: 'c8s2l4', sectionId: 'c8s2', courseId: '8', order: 4, title: '🧪 Quiz: Design Foundations', type: 'quiz', duration: '12 phút', isPreview: false, description: 'Kiểm tra về color, typography, và spacing systems.', resources: [],
      exercise: exercise('ex_c8s2', 'Quiz: Design Foundations', 'Kiểm tra về xây dựng foundations của design system.', 12, 65, [
        q('c8q4', 'single', '8-point grid system nghĩa là gì?', ['Chỉ có 8 màu trong palette', 'Tất cả spacing dùng bội số của 8', 'Grid có 8 columns', 'Font size là 8px'], 'Tất cả spacing dùng bội số của 8', '8pt grid: spacing values (4, 8, 16, 24, 32...) đều là bội số của 8 → consistency và clean math.'),
        q('c8q5', 'single', '"Primary" color trong semantic color system là gì?', ['Màu yêu thích của designer', 'Màu đại diện chính cho brand và interactive elements', 'Màu đầu tiên trong palette', 'Màu phải dùng nhiều nhất'], 'Màu đại diện chính cho brand và interactive elements', 'Primary color = màu brand chính, dùng cho CTAs, links, và interactive elements. Phân biệt với secondary, accent colors.'),
        q('c8q6', 'true_false', 'Type scale nên dùng bội số đều nhau (ví dụ: 12, 14, 16, 18, 20).', ['Đúng', 'Sai'], 'Sai', 'Type scale nên dùng musical scale hoặc ratio (1.25, 1.333) để có visual harmony, không phải linear scale.'),
      ]) },
  ],
};

const c8s3: CourseSection = {
  id: 'c8s3', courseId: '8', order: 3,
  title: 'Tạo và quản lý Components',
  lessons: [
    { id: 'c8s3l1', sectionId: 'c8s3', courseId: '8', order: 1, title: 'Component Architecture: Atomic Design', type: 'video', duration: '13:00', isPreview: false, description: 'Atoms → Molecules → Organisms → Templates → Pages. Cách tổ chức component hierarchy.', resources: [] },
    { id: 'c8s3l2', sectionId: 'c8s3', courseId: '8', order: 2, title: 'Variants và States trong Figma', type: 'video', duration: '15:00', isPreview: false, description: 'Tạo component variants (size, color, state) trong Figma. Auto layout và component properties.', resources: [] },
    { id: 'c8s3l3', sectionId: 'c8s3', courseId: '8', order: 3, title: 'Documentation: Storybook và Notion', type: 'video', duration: '12:00', isPreview: false, description: 'Viết documentation tốt cho design system: do/don\'t examples, code snippets, usage guidelines.', resources: [] },
    { id: 'c8s3l4', sectionId: 'c8s3', courseId: '8', order: 4, title: '🎓 Bài kiểm tra cuối: Design System', type: 'quiz', duration: '20 phút', isPreview: false, description: 'Bài kiểm tra tổng hợp toàn bộ kiến thức về Design System.', resources: [],
      exercise: exercise('ex_c8final', 'Kiểm tra cuối: Design System', 'Kiểm tra toàn diện kiến thức Design System.', 20, 75, [
        q('c8qf1', 'single', 'Atomic Design: Button là ví dụ của cấp độ nào?', ['Atom', 'Molecule', 'Organism', 'Template'], 'Atom', 'Button là atom – element cơ bản không thể chia nhỏ hơn mà vẫn có nghĩa.'),
        q('c8qf2', 'single', 'Search bar (input + button) là ví dụ của cấp độ nào trong Atomic Design?', ['Atom', 'Molecule', 'Organism', 'Template'], 'Molecule', 'Molecule là kết hợp của nhiều atoms (input + button) tạo thành một component có chức năng.'),
        q('c8qf3', 'true_false', 'Design System chỉ cần được maintain bởi designer, không cần developer tham gia.', ['Đúng', 'Sai'], 'Sai', 'Design System tốt cần cả designer lẫn developer cùng maintain để đảm bảo Figma và code luôn sync.'),
        q('c8qf4', 'multiple', 'Governance của Design System bao gồm những gì? (Chọn tất cả đúng)', ['Quy trình đề xuất thay đổi', 'Versioning và changelog', 'Chỉ designer được đọc', 'Process review và approval'], ['Quy trình đề xuất thay đổi', 'Versioning và changelog', 'Process review và approval'], 'Governance đảm bảo design system phát triển có kiểm soát: ai có thể đề xuất thay đổi, ai review, và cách release.'),
        q('c8qf5', 'single', 'Khi nào nên tạo một component mới thay vì dùng component có sẵn?', ['Khi muốn thêm màu mới', 'Khi use case khác đủ để không thể dùng variant của component hiện có', 'Khi designer mới join team', 'Mỗi khi có feature mới'], 'Khi use case khác đủ để không thể dùng variant của component hiện có', 'Component mới chỉ nên tạo khi không thể giải quyết bằng variant. Tránh component bloat.'),
      ]) },
  ],
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const courseSections: Record<string, CourseSection[]> = {
  '1': [c1s1, c1s2, c1s3, c1s4, c1s5, c1s6],
  '2': [c2s1, c2s2, c2s3],
  '3': [c3s1, c3s2, c3s3],
  '4': [c4s1, c4s2, c4s3],
  '5': [c5s1, c5s2, c5s3],
  '6': [c6s1, c6s2, c6s3],
  '7': [c7s1, c7s2, c7s3],
  '8': [c8s1, c8s2, c8s3],
};

/** Flat list of all lessons for a given courseId */
export function getLessonsForCourse(courseId: string): CourseLessonItem[] {
  return (courseSections[courseId] ?? []).flatMap(s => s.lessons);
}

/** Find a specific lesson across all courses */
export function findLesson(courseId: string, lessonId: string): CourseLessonItem | undefined {
  return getLessonsForCourse(courseId).find(l => l.id === lessonId);
}

/** First lesson of a course */
export function getFirstLesson(courseId: string): CourseLessonItem | undefined {
  return courseSections[courseId]?.[0]?.lessons[0];
}

/** Previous and next lesson */
export function getAdjacentLessons(courseId: string, lessonId: string): {
  prev: CourseLessonItem | null;
  next: CourseLessonItem | null;
} {
  const all = getLessonsForCourse(courseId);
  const idx = all.findIndex(l => l.id === lessonId);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
