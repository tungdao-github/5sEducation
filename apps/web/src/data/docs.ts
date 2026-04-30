export type DocSlug =
  | "overview"
  | "frontend"
  | "backend"
  | "database"
  | "payment"
  | "deployment"
  | "defense";

export type DocBlock = {
  heading: string;
  items: string[];
};

export type DocPage = {
  slug: DocSlug;
  title: string;
  eyebrow: string;
  summary: string;
  purpose: string;
  blocks: DocBlock[];
  stackNotes: string[];
  files: string[];
  related: Array<{
    label: string;
    href: string;
  }>;
};

export const docsPages: DocPage[] = [
  {
    slug: "overview",
    title: "Tong quan he thong",
    eyebrow: "Architecture",
    summary:
      "Mot platform hoc lap trinh co course, payment, blog, admin va docs, tach ro frontend, backend va database.",
    purpose:
      "Dung de giai thich voi hoi dong rang he thong khong chi la web hoc hoc thong thuong, ma co boundary ro rang giua cac tang.",
    blocks: [
      {
        heading: "Gia tri cot loi",
        items: [
          "Next.js lam lop giao dien va routing.",
          "C# backend giu business rule va API boundary.",
          "SQL Server giu du lieu giao dich, course, order, progress.",
          "Docs hub giup giai thich kien truc va cach van hanh he thong.",
        ],
      },
      {
        heading: "Kien truc tong the",
        items: [
          "Browser -> Next.js -> C# API -> SQL Server",
          "Admin va giang vien cung di qua cung mot backend boundary.",
        ],
      },
      {
        heading: "Cach bao ve de an",
        items: [
          "Neu hoi ve tai sao tach service, tra loi: de co lap workload va de scale rieng.",
          "Neu hoi ve tai sao khong dung microservices cho tat ca, tra loi: phan core van giu modular monolith.",
          "Neu hoi ve tai sao co docs hub, nhan manh rang do giup bao ve va van hanh nhanh hon.",
        ],
      },
    ],
    stackNotes: [
      "Next.js: route shell, Server Components, client islands.",
      "Mono: boundary ro, adapter o ngoai, core o trong.",
      "MySQL server: query layer va storage layer phai phan tang ro.",
    ],
    files: [
      "apps/web/src/app/layout.tsx",
      "apps/web/src/components/SiteHeader.tsx",
      "apps/api/Program.cs",
      "apps/api/Controllers/AuthController.cs",
      "apps/api/Repositories/CourseCatalogRepository.cs",
    ],
    related: [
      { label: "Frontend", href: "/docs/frontend" },
      { label: "Backend", href: "/docs/backend" },
      { label: "Deployment", href: "/docs/deployment" },
    ],
  },
  {
    slug: "frontend",
    title: "Frontend Next.js",
    eyebrow: "Next.js",
    summary:
      "App Router, Server Components, client islands, shared components, docs va navigation duoc to chuc ro rang.",
    purpose:
      "Dung de giai thich cach xep frontend thanh route shell, views, components, services va data layer, tranh xuat hien them thu muc loan.",
    blocks: [
      {
        heading: "Nguyen tac to chuc",
        items: [
          "app/ chi giu routing, metadata, layout, error va loading.",
          "views/ giu page-level screen; components/ giu UI dung chung.",
          "services/ giu API client; data/ giu dung lieu tinh.",
          "Client component chi dung cho interactivity that su can browser API.",
        ],
      },
      {
        heading: "Phong cach App Router",
        items: [
          "Server Components la mac dinh.",
          "use client chi dat o muc can state hoac browser API.",
          "SEO va metadata dat o route layer.",
          "Docs, support, faq, policy phai la cac route doc lap va de tim.",
        ],
      },
      {
        heading: "Do dung",
        items: [
          "Trang search/courses phai full-width va responsive.",
          "Header phai co docs link de nguoi dung tim tai lieu nhanh.",
          "Route moi nen co layout, title, metadata ro rang.",
        ],
      },
    ],
    stackNotes: [
      "Next.js App Router: route shell + server rendering + metadata.",
      "Shallow client components: push state xuong cang thap cang tot.",
      "Docs hub: giong docxnext, dung de chot kien truc va report.",
    ],
    files: [
      "apps/web/src/app/page.tsx",
      "apps/web/src/app/docs/[[...slug]]/page.tsx",
      "apps/web/src/components/SiteHeader.tsx",
      "apps/web/src/views/Search.tsx",
    ],
    related: [
      { label: "Overview", href: "/docs/overview" },
      { label: "Deployment", href: "/docs/deployment" },
      { label: "Defense", href: "/docs/defense" },
    ],
  },
  {
    slug: "backend",
    title: "Backend C#",
    eyebrow: "ASP.NET Core",
    summary:
      "Controller -> Service -> Repository, auth, upload, SignalR va integration client duoc tach boundary ro rang.",
    purpose:
      "Dung de giai thich vi sao backend khong nen viet logic day controller, va vi sao service khong nen oma DbContext vo toi va.",
    blocks: [
      {
        heading: "Boundary chuan",
        items: [
          "Controller chi nhan request va tra response.",
          "Service giu orchestration va business rule.",
          "Repository giu query/persistence.",
          "Integration client giu giao tiep voi payment, upload va cac he thong ngoai.",
        ],
      },
      {
        heading: "Ly do tach",
        items: [
          "De test don vi.",
          "De thay database provider khong vo het.",
          "De giam logic lap lai va controller phinh ra.",
        ],
      },
      {
        heading: "Diem hoi dong hay hoi",
        items: [
          "Tai sao khong de EF o controller.",
          "Tai sao can repository neu DbContext da co san.",
          "Tai sao payment khong goi tu frontend truc tiep.",
        ],
      },
    ],
    stackNotes: [
      "Mono-style boundary: core logic nam ben trong, transport/adapters o ben ngoai.",
      "Program.cs la composition root, noi dang ky DI va middleware.",
      "API la mot lop canh, khong phai noi nhai business rule.",
    ],
    files: [
      "apps/api/Program.cs",
      "apps/api/Controllers/AuthController.cs",
      "apps/api/Services/AuthWorkflowService.cs",
      "apps/api/Repositories/CourseCatalogRepository.cs",
    ],
    related: [
      { label: "Database", href: "/docs/database" },
      { label: "Payment", href: "/docs/payment" },
    ],
  },
  {
    slug: "database",
    title: "Database SQL Server",
    eyebrow: "SQL",
    summary:
      "Co cau database phai phuc vu query that, transaction that va so tai khoan that; tung workload phai co boundary va index phu hop.",
    purpose:
      "Dung de giai thich cach thiet ke schema, index va migration cho course app va cac workload lien quan.",
    blocks: [
      {
        heading: "Nguyen tac thiet ke",
        items: [
          "Index theo access pattern that, khong theo cam tinh.",
          "Transaction boundary ro khi checkout, enroll, submit va update progress.",
          "Separate database cho workload co truy cap va tinh chat khac nhau.",
        ],
      },
      {
        heading: "Bai hoc tu mysql-server",
        items: [
          "Query optimizer va storage engine phai phan ro.",
          "Hot-path query can composite index dung cho.",
          "Khong danh data layer cho UI query tu do.",
        ],
      },
      {
        heading: "Khi nao hoi dong co the hoi",
        items: [
          "Tai sao dung SQL Server.",
          "Tai sao them index nay.",
          "Tai sao phai co index phu hop voi truy van that.",
        ],
      },
    ],
    stackNotes: [
      "SQL Server phu hop du lieu course/order/progress co quan he va transaction.",
      "Workload rieng can batch write, queue hoac background job phai tach ro.",
      "Migration phai an toan, khong lam dut flow upload/lesson/payment.",
    ],
    files: [
      "apps/api/Data/ApplicationDbContext.cs",
      "apps/api/Migrations",
      "apps/api/Repositories/CourseCatalogRepository.cs",
      "apps/api/Repositories/UserOrdersRepository.cs",
    ],
    related: [
      { label: "Backend", href: "/docs/backend" },
      { label: "Deployment", href: "/docs/deployment" },
    ],
  },
  {
    slug: "payment",
    title: "Thanh toan VietQR / webhook",
    eyebrow: "Payment",
    summary:
      "Checkout tao order pending, sinh QR don nhat va confirm server-side qua webhook / doi soat.",
    purpose:
      "Dung de giai thich flow thanh toan khoa hoc, tranh xu ly thanh toan tu frontend va tranh unlock khoa hoc sai.",
    blocks: [
      {
        heading: "Flow can co",
        items: [
          "Tao order pending tren backend.",
          "Sinh VietQR voi amount va noi dung don hang unique.",
          "Webhook/API payment xac nhan amount + orderCode + signature.",
          "Chi khi confirm moi tao enrollment/mo khoa hoc.",
        ],
      },
      {
        heading: "Tradeoff",
        items: [
          "Neu co webhook: tu dong hon, it code manual hon.",
          "Neu khong co webhook: phai doi soat tay qua admin.",
          "Khong nen unlock course chi vi frontend bao da chuyen tien.",
        ],
      },
      {
        heading: "Noi lien quan den he thong",
        items: [
          "Checkout phai nam trong backend C#.",
          "Frontend chi hien QR va trang thai.",
          "DB phai co order state ro rang va idempotency.",
        ],
      },
    ],
    stackNotes: [
      "VietQR, SePay hoac payOS deu co the dung lam bridge.",
      "Webhook la server-side source of truth, khong phai UI.",
      "Order phai idempotent de tranh double confirm.",
    ],
    files: [
      "apps/api/Controllers/CartController.cs",
      "apps/api/Services/CartCheckoutService.cs",
      "apps/api/Services/CartCheckoutNotificationService.cs",
    ],
    related: [
      { label: "Backend", href: "/docs/backend" },
      { label: "Database", href: "/docs/database" },
      { label: "Deployment", href: "/docs/deployment" },
    ],
  },
  {
    slug: "deployment",
    title: "Deployment & operations",
    eyebrow: "Release",
    summary:
      "Frontend va backend run tach service, co env ro rang, co canh bao build va co tai lieu van hanh.",
    purpose:
      "Dung de chot cach chay du an khi demo, deploy hoac build cai nay sang may khac.",
    blocks: [
      {
        heading: "Deployment shape",
        items: [
          "Main web app chay rieng.",
          "API chay rieng.",
          "Moi service co env va port ro rang.",
        ],
      },
      {
        heading: "Van hanh",
        items: [
          "Docs hub giup nhac cac luong quan trong.",
          "Support/FAQ/Policy giup demo truoc hoi dong.",
          "Logging va error boundary phai on dinh.",
        ],
      },
      {
        heading: "Khi can nang cap",
        items: [
          "Uu tien cac route quan trong: home, course, checkout, docs.",
          "Cap nhat payment theo webhook va worker neu can.",
          "Khong deploy chong len nhau giua web va api.",
        ],
      },
    ],
    stackNotes: [
      "Next.js App Router phu hop route-level deploy/SSR.",
      "Backend C# co the build va test rieng.",
      "Can tach background job neu load tang cao.",
    ],
    files: [
      "apps/web/src/app/layout.tsx",
      "apps/api/Program.cs",
      "apps/api/appsettings.json",
    ],
    related: [
      { label: "Overview", href: "/docs/overview" },
      { label: "Defense", href: "/docs/defense" },
    ],
  },
  {
    slug: "defense",
    title: "Phong van / bao ve do an",
    eyebrow: "Defense",
    summary:
      "Bo cau hoi hoi dong hay hoi va cach tra loi ngan gon, vang, dung trong tam.",
    purpose:
      "Dung de hoc thuoc truoc phan bao ve, tap trung vao kien truc, database, payment va ly do chon cong nghe.",
    blocks: [
      {
        heading: "Cau hoi co the gap",
        items: [
          "Tai sao dung SQL Server va khong share DB.",
          "Tai sao frontend chi goi API.",
        ],
      },
      {
        heading: "Cach tra loi",
        items: [
          "Noi ve boundary ro rang va workload rieng.",
          "Noi ve tang an toan va de scale.",
          "Noi ve tradeoff giua do phuc tap va gia tri thuc te.",
        ],
      },
      {
        heading: "Ket luan bao ve",
        items: [
          "He thong co course, payment, blog, admin va docs.",
          "Kien truc duoc tach theo dung vai tro tung thanh phan.",
          "Do an co the demo, co the mo rong va co the van hanh.",
        ],
      },
    ],
    stackNotes: [
      "Next.js: route shell + UI docs.",
      "C#: boundary ro va tich hop he thong ngoai.",
      "SQL: index/transaction/history phai co logic ro.",
    ],
    files: [
      "reports/ANALYSIS_DESIGN.md",
      "reports/POWERPOINT_REQUEST.md",
      "apps/web/src/app/docs/[[...slug]]/page.tsx",
    ],
    related: [
      { label: "Overview", href: "/docs/overview" },
      { label: "Frontend", href: "/docs/frontend" },
      { label: "Backend", href: "/docs/backend" },
    ],
  },
];

export function getDocPage(slug?: string[]): DocPage {
  const key = (slug?.[0] ?? "overview") as DocSlug;
  return docsPages.find((page) => page.slug === key) ?? docsPages[0];
}

export function getDocNavigation() {
  return docsPages.map(({ slug, title, summary }) => ({
    slug,
    title,
    summary,
    href: `/docs/${slug}`,
  }));
}
