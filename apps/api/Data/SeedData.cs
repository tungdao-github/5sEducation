using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        var defaultPassword = configuration["Seed:DefaultPassword"];
        if (string.IsNullOrWhiteSpace(defaultPassword))
        {
            defaultPassword = "ChangeMe123!";
        }

        var adminEmail = configuration["Seed:AdminEmail"] ?? "admin@udemyclone.dev";
        var instructorEmail = configuration["Seed:InstructorEmail"] ?? "instructor@udemyclone.dev";
        var userEmail = configuration["Seed:UserEmail"] ?? "tungdao123pzo@gmail.com";
        var autoConfirmEmails = string.Equals(configuration["Seed:AutoConfirmEmails"], "true", StringComparison.OrdinalIgnoreCase);
        var dbProvider = configuration["DbProvider"] ?? "SqlServer";

        var resetPasswords = string.Equals(configuration["Seed:ResetPasswords"], "true", StringComparison.OrdinalIgnoreCase);
        var resetDefaultAccounts = resetPasswords;

        if (dbProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
        {
            await db.Database.EnsureCreatedAsync();
        }
        else
        {
            await db.Database.MigrateAsync();
        }

        await EnsureRoleAsync(roleManager, "Admin");
        await EnsureRoleAsync(roleManager, "Instructor");
        await EnsureRoleAsync(roleManager, "User");

        if (resetPasswords)
        {
            await ResetAllUserPasswordsAsync(userManager, defaultPassword);
            resetDefaultAccounts = false;
        }

        var admin = await EnsureUserAsync(
            userManager,
            adminEmail,
            "Tung",
            "Admin",
            defaultPassword,
            resetDefaultAccounts,
            autoConfirmEmails);
        await EnsureUserInRoleAsync(userManager, admin, "Admin");

        var instructor = await EnsureUserAsync(
            userManager,
            instructorEmail,
            "Tung",
            "Instructor",
            defaultPassword,
            resetDefaultAccounts,
            autoConfirmEmails);
        await EnsureUserInRoleAsync(userManager, instructor, "Instructor");

        var user = await EnsureUserAsync(
            userManager,
            userEmail,
            "tungdao",
            "tungdao",
            defaultPassword,
            resetDefaultAccounts,
            autoConfirmEmails);
        await EnsureUserInRoleAsync(userManager, user, "User");

        var instructorProfiles = new[]
        {
            new { Email = "tanner.kohler@educourse.dev", FirstName = "Tanner", LastName = "Kohler" },
            new { Email = "huei-hsin.wang@educourse.dev", FirstName = "Huei-Hsin", LastName = "Wang" },
            new { Email = "kate.moran@educourse.dev", FirstName = "Kate", LastName = "Moran" },
            new { Email = "sarah.gibbons@educourse.dev", FirstName = "Sarah", LastName = "Gibbons" },
            new { Email = "jakob.nielsen@educourse.dev", FirstName = "Jakob", LastName = "Nielsen" },
            new { Email = "maria.rosala@educourse.dev", FirstName = "Maria", LastName = "Rosala" },
            new { Email = "rachel.krause@educourse.dev", FirstName = "Rachel", LastName = "Krause" },
            new { Email = "therese.fessenden@educourse.dev", FirstName = "Therese", LastName = "Fessenden" }
        };

        var instructors = new Dictionary<string, ApplicationUser>(StringComparer.OrdinalIgnoreCase)
        {
            [instructorEmail] = instructor
        };

        foreach (var profile in instructorProfiles)
        {
            var created = await EnsureUserAsync(
                userManager,
                profile.Email,
                profile.FirstName,
                profile.LastName,
                defaultPassword,
                resetDefaultAccounts,
                autoConfirmEmails);
            await EnsureUserInRoleAsync(userManager, created, "Instructor");
            instructors[profile.Email] = created;
        }

        var studentUsers = new List<ApplicationUser> { user };
        for (var i = 1; i <= 8; i += 1)
        {
            var student = await EnsureUserAsync(
                userManager,
                $"student{i}@educourse.dev",
                "Student",
                i.ToString("00"),
                defaultPassword,
                resetDefaultAccounts,
                autoConfirmEmails);
            await EnsureUserInRoleAsync(userManager, student, "User");
            studentUsers.Add(student);
        }

        if (!await db.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Title = "Development", Slug = SlugHelper.Slugify("Development") },
                new() { Title = "Business", Slug = SlugHelper.Slugify("Business") },
                new() { Title = "Design", Slug = SlugHelper.Slugify("Design") }
            };
            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();
        }

        var categorySeeds = new[]
        {
            "Thiết kế UX/UI",
            "Nghiên cứu UX",
            "Viết nội dung UX",
            "Quản lý UX",
            "Phân tích UX"
        };

        foreach (var categoryTitle in categorySeeds)
        {
            await EnsureCategoryAsync(db, categoryTitle);
        }

        if (!await db.Courses.AnyAsync())
        {
            var category = await db.Categories.FirstAsync();

            var course = new Course
            {
                Title = "ASP.NET Core Udemy Clone",
                Slug = SlugHelper.Slugify("ASP.NET Core Udemy Clone"),
                InstructorId = instructor.Id,
                CategoryId = category.Id,
                ShortDescription = "Build a full Udemy clone with ASP.NET Core and Next.js.",
                Description = "Learn how to ship an e-learning marketplace end-to-end.",
                Outcome = "Ship a production-ready learning platform.",
                Requirements = "C# and web fundamentals.",
                Language = "English",
                Price = 19.99m,
                Level = "Beginner",
                ThumbnailUrl = "/uploads/seed-course.jpg",
                PreviewVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Courses.Add(course);
            await db.SaveChangesAsync();

            db.Lessons.AddRange(
                new Lesson
                {
                    CourseId = course.Id,
                    Title = "Introduction",
                    ContentType = "video",
                    DurationMinutes = 5,
                    SortOrder = 1,
                    VideoUrl = course.PreviewVideoUrl
                },
                new Lesson
                {
                    CourseId = course.Id,
                    Title = "Quick check: ASP.NET Core pipeline",
                    ContentType = "exercise",
                    DurationMinutes = 3,
                    SortOrder = 2,
                    ExerciseQuestion = "Which ASP.NET Core component usually handles route matching first?",
                    ExerciseOptionA = "Kestrel",
                    ExerciseOptionB = "Middleware pipeline",
                    ExerciseOptionC = "EF Core",
                    ExerciseOptionD = "Razor compiler",
                    ExerciseCorrectOption = 2,
                    ExerciseExplanation = "Routing is part of the ASP.NET Core middleware pipeline."
                },
                new Lesson
                {
                    CourseId = course.Id,
                    Title = "Setup",
                    ContentType = "video",
                    DurationMinutes = 12,
                    SortOrder = 3,
                    VideoUrl = course.PreviewVideoUrl
                }
            );

            await db.SaveChangesAsync();
        }

        var devCategory = await db.Categories.FirstOrDefaultAsync(c => c.Slug == "development")
            ?? await db.Categories.FirstAsync();
        var nodeCourseTitle = "Backend NodeJS Middle 2026";
        var nodeCourseSlug = SlugHelper.Slugify(nodeCourseTitle);
        var nodeCourse = await db.Courses.FirstOrDefaultAsync(c => c.Slug == nodeCourseSlug);
        if (nodeCourse == null)
        {
            nodeCourse = new Course
            {
                Title = nodeCourseTitle,
                Slug = nodeCourseSlug,
                InstructorId = instructor.Id,
                CategoryId = devCategory.Id,
                ShortDescription = "Khoa hoc NodeJS Middle 2026, 60 bai, 8 thang, du an E-Commerce.",
                Description =
                    "KHOA HOC BACKEND NODEJS MIDDLE 2026 - SIEU CHUYEN SAU & THUC CHIEN\n\n" +
                    "Doi tuong: hoc vien da co nen tang ve Backend NodeJS hoac Fullstack NodeJS.\n" +
                    "So bai hoc: 60 bai (100% thuc hanh).\n" +
                    "Thoi gian hoc: 8 thang.\n" +
                    "Du an xuyen suot: E-Commerce chuyen nghiep tu A den Z.\n" +
                    "Hinh thuc: Online qua Zoom. Lich hoc: 1 buoi/tuần, 4h/buoi.\n\n" +
                    "Lo trinh khoa hoc (rut gon):\n" +
                    "- UI/UX cho trang chu, da ngon ngu, chat ho tro, responsive.\n" +
                    "- Auth: Email/JWT, Google/Facebook, quen mat khau.\n" +
                    "- Search nang cao, goi y, voice search, lich su xem.\n" +
                    "- Course detail, goi y lien quan, so sanh, flash sale.\n" +
                    "- Cart/checkout, ma giam gia, van chuyen, thanh toan.\n" +
                    "- Blog/SEO, quan ly noi dung, admin panel.\n" +
                    "- File storage microservice (video, file, PDF).\n\n" +
                    "Muc tieu: nang tam tu duy kien truc, thiet ke he thong lon, toi uu hieu nang va bao mat.",
                Outcome = "Tu tin dat chuan Backend NodeJS Middle, lam chu thiet ke he thong, hieu nang, bao mat.",
                Requirements = "Da co kien thuc co ban ve Backend NodeJS hoac Fullstack NodeJS.",
                Language = "Vietnamese",
                Price = 99.99m,
                Level = "Intermediate",
                ThumbnailUrl = "/uploads/seed-course.jpg",
                PreviewVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Courses.Add(nodeCourse);
            await db.SaveChangesAsync();
        }

        if (!await db.Lessons.AnyAsync(l => l.CourseId == nodeCourse.Id))
        {
            db.Lessons.AddRange(
                new Lesson
                {
                    CourseId = nodeCourse.Id,
                    Title = "Kickoff & system architecture",
                    ContentType = "video",
                    DurationMinutes = 30,
                    SortOrder = 1,
                    VideoUrl = nodeCourse.PreviewVideoUrl
                },
                new Lesson
                {
                    CourseId = nodeCourse.Id,
                    Title = "Authentication & authorization deep dive",
                    ContentType = "video",
                    DurationMinutes = 45,
                    SortOrder = 2,
                    VideoUrl = nodeCourse.PreviewVideoUrl
                },
                new Lesson
                {
                    CourseId = nodeCourse.Id,
                    Title = "E-Commerce core modules overview",
                    ContentType = "video",
                    DurationMinutes = 40,
                    SortOrder = 3,
                    VideoUrl = nodeCourse.PreviewVideoUrl
                }
            );

            await db.SaveChangesAsync();
        }

        var claudeCourseTitle = "Claude Code Vibe Coding";
        var claudeCourseSlug = SlugHelper.Slugify(claudeCourseTitle);
        var claudeCourse = await db.Courses.FirstOrDefaultAsync(c => c.Slug == claudeCourseSlug);
        if (claudeCourse == null)
        {
            claudeCourse = new Course
            {
                Title = claudeCourseTitle,
                Slug = claudeCourseSlug,
                InstructorId = instructor.Id,
                CategoryId = devCategory.Id,
                ShortDescription = "10 chuong, 57 bai giang, 9.5 gio tong thoi luong.",
                Description =
                    "Noi dung khoa hoc tap trung vao Claude AI/Claude Code va ky nang lam viec voi AI.\n\n" +
                    "Chuong 1: Setup moi truong thuc hanh voi Claude AI.\n" +
                    "Chuong 2: Cam nhan Claude Code lam duoc gi, va gioi han o dau.\n" +
                    "Chuong 3: Hieu dung suc manh cua cong cu AI.\n" +
                    "Chuong 4: Su dung Claude Code voi Plan Mode.\n" +
                    "Chuong 5: Xu ly bai toan AI bi quen khi context lon.\n" +
                    "Chuong 6: Ap dung Plan Mode + CLAUDE.md cho vibe coding hieu qua.\n" +
                    "Chuong 7: Custom commands/Skills de dong goi prompt.\n" +
                    "Chuong 8: Dung Claude Code va Git de quan ly ma nguon.\n" +
                    "Chuong 9: MCP, Subagents, Agent Teams, Hooks.\n" +
                    "Chuong 10: Tong ket va roadmap tu hoc voi AI.\n\n" +
                    "Hinh thuc hoc: Online. Tap trung thuc hanh va quy trinh lam viec chuyen nghiep.",
                Outcome = "Lam chu quy trinh lam viec voi AI, tu tin ap dung trong du an thuc te.",
                Requirements = "Da co nen tang ve backend/Fullstack hoac da tung lam viec voi NodeJS.",
                Language = "Vietnamese",
                Price = 79.99m,
                Level = "Intermediate",
                ThumbnailUrl = "/uploads/seed-course.jpg",
                PreviewVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Courses.Add(claudeCourse);
            await db.SaveChangesAsync();
        }

        if (!await db.Lessons.AnyAsync(l => l.CourseId == claudeCourse.Id))
        {
            var claudeLessonTitles = new[]
            {
                "1.1 Gioi thieu ve Claude AI",
                "1.2 Tao tai khoan Claude AI va subscription",
                "1.3 Cai dat cong cu coding - VSCode",
                "1.4 Cai dat cong cu coding - Antigravity",
                "1.5 Token - Cach dich vu AI tinh tien",
                "1.6 Context window va kha nang ghi nho cua AI",
                "1.7 Tai lieu cua Claude AI",
                "1.8 Cai dat moi truong Node.js",
                "1.9 Cai dat MySQL va cong cu quan ly",
                "2.1 Claude Code overview",
                "2.2 Cac nen tang tich hop Claude Code",
                "2.3 Su dung chat-based Claude.ai hieu qua",
                "2.4 Su dung IDE-integrated (Antigravity) hieu qua",
                "2.5 Vibe Coding Project 01 voi Claude Code",
                "3.1 [Mindset] San pham chay duoc - San pham ban duoc",
                "3.2 [Mindset] AI hoat dong theo xac suat - Bay cua vibe coding",
                "3.3 [Mindset] Ban la kien truc su, AI la tho xay",
                "4.1 Cach Claude Code hoat dong",
                "4.2 Plan Mode la gi",
                "4.3 Cach doc, phan bien plan va nhan biet plan te",
                "4.4 Thuc hanh su dung Plan Mode",
                "5.1 Tai sao AI quen va cach giai quyet",
                "5.2 CLAUDE.md - Bo nho dai han cho du an",
                "5.3 He thong bo nho cua Claude Code - CLAUDE.md va Auto Memory",
                "5.4 Thuc hanh viet CLAUDE.md (Basic)",
                "6.1 Y tuong du an va research truoc khi vibe coding",
                "6.2 Flow lam viec voi vibe coding",
                "6.3 Phan tich cau truc tai lieu",
                "6.4 Phan tich database",
                "6.5 Viet chi tiet docs",
                "6.6 Viet docs voi Claude Code",
                "6.7 Setup project thuc hanh",
                "6.8 Viet CLAUDE.md",
                "7.1 Custom slash commands/Skills la gi",
                "7.2 Tao skills cua chinh ban (Skill.md)",
                "7.3 Coding theo feature - Workflow hoan chinh",
                "7.4 Tao base du an thuc hanh theo docs",
                "7.5 Viet CRUD theo convention cua du an",
                "7.6 Viet test tu dong voi skill (Automation Testing)",
                "7.7 Giai thich code (danh cho beginners)",
                "8.1 Viet commit message chuan convention",
                "8.2 Resolve merge conflict",
                "8.3 Dung checkpoints - luu state tu dong, rewind khi AI lam hong",
                "8.4 Debugging voi Claude",
                "8.5 Hoan thien du an thuc hanh",
                "9.1 MCP - Model Context Protocol",
                "9.2 Su dung Chrome Devtools MCP",
                "9.3 Su dung Figma MCP",
                "9.4 Cach tu viet MCP cua ban",
                "9.5 Subagents",
                "9.6 Agent Teams",
                "9.7 Hooks",
                "9.8 Remote Control",
                "9.9 Plugin Marketplaces",
                "9.10 Su dung Skill.sh",
                "10.1 Dung tool nao hieu qua tot nhat",
                "10.2 Roadmap de tu hoc voi AI"
            };

            var sortOrder = 1;
            foreach (var title in claudeLessonTitles)
            {
                db.Lessons.Add(new Lesson
                {
                    CourseId = claudeCourse.Id,
                    Title = title,
                    ContentType = "video",
                    DurationMinutes = 10,
                    SortOrder = sortOrder,
                    VideoUrl = claudeCourse.PreviewVideoUrl
                });
                sortOrder += 1;
            }

            await db.SaveChangesAsync();
        }

        var uxCourseSeeds = new List<CourseSeed>
        {
            new CourseSeed
            {
                Title = "Nguyên tắc Gestalt: Thiết kế giao diện trực quan",
                CategorySlug = SlugHelper.Slugify("Thiết kế UX/UI"),
                InstructorEmail = "tanner.kohler@educourse.dev",
                Price = 289000m,
                FlashSalePrice = 202000m,
                Level = "Intermediate",
                Language = "Vietnamese",
                ShortDescription = "Áp dụng nguyên tắc Gestalt để thiết kế giao diện trực quan.",
                Description = "Khóa học tập trung vào các nguyên tắc Gestalt, cách nhóm thông tin và tạo bố cục trực quan.",
                Outcome = "Nắm vững cách áp dụng Gestalt để tăng tính trực quan và dễ hiểu.",
                Requirements = "Đã có kiến thức UI/UX cơ bản.",
                LessonCount = 24,
                LessonMinutes = 12,
                ReviewCount = 3,
                Rating = 5
            },
            new CourseSeed
            {
                Title = "Các điều khiển đầu vào: Mẫu thiết kế và thực tiễn",
                CategorySlug = SlugHelper.Slugify("Thiết kế UX/UI"),
                InstructorEmail = "huei-hsin.wang@educourse.dev",
                Price = 289000m,
                FlashSalePrice = 202000m,
                Level = "Beginner",
                Language = "Vietnamese",
                ShortDescription = "Thiết kế input controls rõ ràng, dễ tiếp cận.",
                Description = "Tổng hợp các mẫu input phổ biến và cách áp dụng trong form.",
                Outcome = "Thiết kế form tối ưu, giảm sai sót cho người dùng.",
                Requirements = "Không yêu cầu.",
                LessonCount = 20,
                LessonMinutes = 10,
                ReviewCount = 3,
                Rating = 5
            },
            new CourseSeed
            {
                Title = "Microcopy: Tiêu đề, đề mục, thẻ và nhiều hơn nữa",
                CategorySlug = SlugHelper.Slugify("Viết nội dung UX"),
                InstructorEmail = "kate.moran@educourse.dev",
                Price = 199000m,
                FlashSalePrice = 139000m,
                Level = "Beginner",
                Language = "Vietnamese",
                ShortDescription = "Viết microcopy giúp người dùng ra quyết định nhanh.",
                Description = "Tập trung vào các nguyên tắc viết microcopy ngắn gọn, rõ ràng.",
                Outcome = "Viết nội dung UX hiệu quả, giảm tải nhận thức.",
                Requirements = "Không yêu cầu.",
                LessonCount = 18,
                LessonMinutes = 10,
                ReviewCount = 3,
                Rating = 5
            },
            new CourseSeed
            {
                Title = "Thể hiện giá trị UX",
                CategorySlug = SlugHelper.Slugify("Quản lý UX"),
                InstructorEmail = "sarah.gibbons@educourse.dev",
                Price = 199000m,
                FlashSalePrice = 139000m,
                Level = "Intermediate",
                Language = "Vietnamese",
                ShortDescription = "Chứng minh tác động UX bằng dữ liệu.",
                Description = "Hướng dẫn đo lường và trình bày giá trị UX với stakeholders.",
                Outcome = "Tạo báo cáo UX thuyết phục, gắn với KPI.",
                Requirements = "Hiểu quy trình UX căn bản.",
                LessonCount = 14,
                LessonMinutes = 12,
                ReviewCount = 3,
                Rating = 5
            },
            new CourseSeed
            {
                Title = "10 nguyên tắc đánh giá khả năng sử dụng",
                CategorySlug = SlugHelper.Slugify("Thiết kế UX/UI"),
                InstructorEmail = "jakob.nielsen@educourse.dev",
                Price = 99000m,
                FlashSalePrice = 99000m,
                Level = "All Levels",
                Language = "Vietnamese",
                ShortDescription = "Hiểu 10 heuristic để đánh giá usability.",
                Description = "Phân tích 10 nguyên tắc heuristic và cách áp dụng.",
                Outcome = "Nhận diện vấn đề UX nhanh và đề xuất cải tiến.",
                Requirements = "Không yêu cầu.",
                LessonCount = 22,
                LessonMinutes = 10,
                ReviewCount = 4,
                Rating = 5
            },
            new CourseSeed
            {
                Title = "Nghiên cứu người dùng: Phương pháp và kỹ thuật",
                CategorySlug = SlugHelper.Slugify("Nghiên cứu UX"),
                InstructorEmail = "maria.rosala@educourse.dev",
                Price = 289000m,
                FlashSalePrice = 202000m,
                Level = "Intermediate",
                Language = "Vietnamese",
                ShortDescription = "Hệ thống hóa các phương pháp nghiên cứu UX.",
                Description = "Khám phá cách thu thập insight và kiểm thử UX.",
                Outcome = "Chọn đúng phương pháp và phân tích insight.",
                Requirements = "Biết quy trình UX cơ bản.",
                LessonCount = 26,
                LessonMinutes = 12,
                ReviewCount = 3,
                Rating = 5
            },
            new CourseSeed
            {
                Title = "Phân tích và Trải nghiệm người dùng",
                CategorySlug = SlugHelper.Slugify("Phân tích UX"),
                InstructorEmail = "rachel.krause@educourse.dev",
                Price = 249000m,
                FlashSalePrice = 199000m,
                Level = "Intermediate",
                Language = "Vietnamese",
                ShortDescription = "Dùng dữ liệu phân tích để tối ưu UX.",
                Description = "Cách đọc dữ liệu analytics và kết hợp nghiên cứu.",
                Outcome = "Ra quyết định UX dựa trên số liệu.",
                Requirements = "Đã từng làm UX cơ bản.",
                LessonCount = 18,
                LessonMinutes = 12,
                ReviewCount = 3,
                Rating = 4
            },
            new CourseSeed
            {
                Title = "Thiết kế hệ thống Design System",
                CategorySlug = SlugHelper.Slugify("Thiết kế UX/UI"),
                InstructorEmail = "therese.fessenden@educourse.dev",
                Price = 349000m,
                FlashSalePrice = 279000m,
                Level = "Advanced",
                Language = "Vietnamese",
                ShortDescription = "Xây dựng design system bền vững.",
                Description = "Tạo hệ thống component nhất quán cho sản phẩm.",
                Outcome = "Thiết kế và quản trị design system hiệu quả.",
                Requirements = "Đã có kinh nghiệm UI/UX.",
                LessonCount = 28,
                LessonMinutes = 12,
                ReviewCount = 3,
                Rating = 5
            }
        };

        foreach (var seed in uxCourseSeeds)
        {
            if (!instructors.TryGetValue(seed.InstructorEmail, out var seedInstructor))
            {
                seedInstructor = instructor;
            }

            var category = await db.Categories.FirstOrDefaultAsync(c => c.Slug == seed.CategorySlug)
                ?? await db.Categories.FirstAsync();

            var course = await EnsureCourseAsync(db, seed, seedInstructor, category);
            await EnsureLessonsAsync(db, course, seed.LessonCount, seed.LessonMinutes);
            await EnsureEnrollmentsAsync(db, course, studentUsers, seed.ReviewCount + 2);
            await EnsureReviewsAsync(db, course, studentUsers, seed.ReviewCount, seed.Rating);
        }

        if (!await db.Coupons.AnyAsync())
        {
            var now = DateTime.UtcNow;
            db.Coupons.AddRange(
                new Coupon
                {
                    Code = "GESTALT30",
                    Description = "Giảm 30% cho khóa Gestalt",
                    Type = "percent",
                    Value = 30,
                    MinOrder = 199000,
                    MaxUses = 200,
                    UsedCount = 0,
                    ExpiresAt = now.AddMonths(2),
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new Coupon
                {
                    Code = "UX199",
                    Description = "Giảm 50K cho đơn từ 199K",
                    Type = "fixed",
                    Value = 50000,
                    MinOrder = 199000,
                    MaxUses = 300,
                    UsedCount = 0,
                    ExpiresAt = now.AddMonths(1),
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new Coupon
                {
                    Code = "WELCOME10",
                    Description = "Giảm 10% cho học viên mới",
                    Type = "percent",
                    Value = 10,
                    MinOrder = 99000,
                    MaxUses = 500,
                    UsedCount = 0,
                    ExpiresAt = now.AddMonths(3),
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            );

            await db.SaveChangesAsync();
        }

        if (!await db.LearningPaths.AnyAsync())
        {
            var course = await db.Courses.FirstAsync();
            var path = new LearningPath
            {
                Title = "Frontend Developer Path",
                Slug = SlugHelper.Slugify("Frontend Developer Path"),
                Description = "Go from HTML basics to production-ready web apps.",
                Level = "Beginner",
                ThumbnailUrl = "/uploads/seed-path.jpg",
                EstimatedHours = 40,
                IsPublished = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.LearningPaths.Add(path);
            await db.SaveChangesAsync();

            var section = new LearningPathSection
            {
                LearningPathId = path.Id,
                Title = "Core foundations",
                Description = "Start with HTML, CSS, and core browser concepts.",
                SortOrder = 1
            };
            db.LearningPathSections.Add(section);
            await db.SaveChangesAsync();

            db.LearningPathCourses.Add(new LearningPathCourse
            {
                LearningPathId = path.Id,
                LearningPathSectionId = section.Id,
                CourseId = course.Id,
                SortOrder = 1,
                IsRequired = true
            });
            await db.SaveChangesAsync();
        }

        if (!await db.HomePageBlocks.AnyAsync())
        {
            db.HomePageBlocks.AddRange(
                new HomePageBlock
                {
                    Key = "hero-default",
                    Type = "hero",
                    Title = "Build skills that turn into real work.",
                    Subtitle = "Structured paths, mentor feedback, and project-based learning for real-world teams.",
                    ImageUrl = string.Empty,
                    CtaText = "Explore paths",
                    CtaUrl = "/paths",
                    ItemsJson = "[\"Curated paths\",\"Live reviews\",\"Career projects\"]",
                    Locale = "en",
                    SortOrder = 1,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "hero-default-vi",
                    Type = "hero",
                    Title = "Xay dung ky nang de lam viec thuc te.",
                    Subtitle = "Lo trinh co cau truc, mentor dong hanh, du an gan thuc tien.",
                    ImageUrl = string.Empty,
                    CtaText = "Xem lo trinh",
                    CtaUrl = "/paths",
                    ItemsJson = "[\"Lo trinh chon loc\",\"Review truc tiep\",\"Du an nghe nghiep\"]",
                    Locale = "vi",
                    SortOrder = 1,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "cta-default",
                    Type = "cta",
                    Title = "Build a learning journey for your team",
                    Subtitle = "Create cohort-based programs, assign mentors, and track outcomes across every role.",
                    CtaText = "Start free trial",
                    CtaUrl = "/register",
                    SortOrder = 20,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "stats-default",
                    Type = "stats",
                    Title = "Proof of outcomes",
                    Subtitle = "Highlights",
                    ItemsJson = "[{\"value\":\"120+\",\"label\":\"Mentor hours\",\"subLabel\":\"Weekly review cycles\"},{\"value\":\"95%\",\"label\":\"Completion rate\"},{\"value\":\"50+\",\"label\":\"Hiring partners\"},{\"value\":\"7d\",\"label\":\"Project sprint\",\"subLabel\":\"From brief to delivery\"}]",
                    Locale = "en",
                    SortOrder = 12,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "stats-default-vi",
                    Type = "stats",
                    Title = "So lieu noi bat",
                    Subtitle = "Thanh tuu",
                    ItemsJson = "[{\"value\":\"120+\",\"label\":\"Gio mentor\",\"subLabel\":\"Review hang tuan\"},{\"value\":\"95%\",\"label\":\"Ty le hoan thanh\"},{\"value\":\"50+\",\"label\":\"Doi tac tuyen dung\"},{\"value\":\"7 ngay\",\"label\":\"Sprint du an\",\"subLabel\":\"Tu brief den delivery\"}]",
                    Locale = "vi",
                    SortOrder = 12,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "testimonial-default",
                    Type = "testimonial",
                    Title = "Learners share the impact",
                    Subtitle = "Testimonials",
                    ItemsJson = "[{\"quote\":\"Clear feedback loops and practical projects kept me shipping every week.\",\"name\":\"Minh Tran\",\"role\":\"Product Designer\",\"company\":\"Fintech\"},{\"quote\":\"The mentor sessions felt like real product reviews — super actionable.\",\"name\":\"Le Quang\",\"role\":\"Frontend Engineer\",\"company\":\"SaaS\"},{\"quote\":\"I finally built a portfolio case study I am proud to show.\",\"name\":\"Ngoc Anh\",\"role\":\"Business Analyst\",\"company\":\"Consulting\"}]",
                    Locale = "en",
                    SortOrder = 14,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "testimonial-default-vi",
                    Type = "testimonial",
                    Title = "Hoc vien noi gi",
                    Subtitle = "Danh gia",
                    ItemsJson = "[{\"quote\":\"Co feedback ro rang nen tuan nao minh cung ship du an.\",\"name\":\"Minh Tran\",\"role\":\"Product Designer\",\"company\":\"Fintech\"},{\"quote\":\"Mentor review nhu review san pham that, rat de ap dung.\",\"name\":\"Le Quang\",\"role\":\"Frontend Engineer\",\"company\":\"SaaS\"},{\"quote\":\"Lan dau tien minh co case study portfolio day du.\",\"name\":\"Ngoc Anh\",\"role\":\"Business Analyst\",\"company\":\"Consulting\"}]",
                    Locale = "vi",
                    SortOrder = 14,
                    IsPublished = true
                }
            );
            await db.SaveChangesAsync();
        }
        else
        {
            var existingKeys = await db.HomePageBlocks.Select(b => b.Key).ToListAsync();
            var extraBlocks = new List<HomePageBlock>
            {
                new HomePageBlock
                {
                    Key = "stats-default",
                    Type = "stats",
                    Title = "Proof of outcomes",
                    Subtitle = "Highlights",
                    ItemsJson = "[{\"value\":\"120+\",\"label\":\"Mentor hours\",\"subLabel\":\"Weekly review cycles\"},{\"value\":\"95%\",\"label\":\"Completion rate\"},{\"value\":\"50+\",\"label\":\"Hiring partners\"},{\"value\":\"7d\",\"label\":\"Project sprint\",\"subLabel\":\"From brief to delivery\"}]",
                    Locale = "en",
                    SortOrder = 12,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "stats-default-vi",
                    Type = "stats",
                    Title = "So lieu noi bat",
                    Subtitle = "Thanh tuu",
                    ItemsJson = "[{\"value\":\"120+\",\"label\":\"Gio mentor\",\"subLabel\":\"Review hang tuan\"},{\"value\":\"95%\",\"label\":\"Ty le hoan thanh\"},{\"value\":\"50+\",\"label\":\"Doi tac tuyen dung\"},{\"value\":\"7 ngay\",\"label\":\"Sprint du an\",\"subLabel\":\"Tu brief den delivery\"}]",
                    Locale = "vi",
                    SortOrder = 12,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "testimonial-default",
                    Type = "testimonial",
                    Title = "Learners share the impact",
                    Subtitle = "Testimonials",
                    ItemsJson = "[{\"quote\":\"Clear feedback loops and practical projects kept me shipping every week.\",\"name\":\"Minh Tran\",\"role\":\"Product Designer\",\"company\":\"Fintech\"},{\"quote\":\"The mentor sessions felt like real product reviews — super actionable.\",\"name\":\"Le Quang\",\"role\":\"Frontend Engineer\",\"company\":\"SaaS\"},{\"quote\":\"I finally built a portfolio case study I am proud to show.\",\"name\":\"Ngoc Anh\",\"role\":\"Business Analyst\",\"company\":\"Consulting\"}]",
                    Locale = "en",
                    SortOrder = 14,
                    IsPublished = true
                },
                new HomePageBlock
                {
                    Key = "testimonial-default-vi",
                    Type = "testimonial",
                    Title = "Hoc vien noi gi",
                    Subtitle = "Danh gia",
                    ItemsJson = "[{\"quote\":\"Co feedback ro rang nen tuan nao minh cung ship du an.\",\"name\":\"Minh Tran\",\"role\":\"Product Designer\",\"company\":\"Fintech\"},{\"quote\":\"Mentor review nhu review san pham that, rat de ap dung.\",\"name\":\"Le Quang\",\"role\":\"Frontend Engineer\",\"company\":\"SaaS\"},{\"quote\":\"Lan dau tien minh co case study portfolio day du.\",\"name\":\"Ngoc Anh\",\"role\":\"Business Analyst\",\"company\":\"Consulting\"}]",
                    Locale = "vi",
                    SortOrder = 14,
                    IsPublished = true
                }
            };

            var newBlocks = extraBlocks.Where(block => !existingKeys.Contains(block.Key)).ToList();
            if (newBlocks.Count > 0)
            {
                db.HomePageBlocks.AddRange(newBlocks);
                await db.SaveChangesAsync();
            }
        }

        await EnsureSystemSettingsAsync(db);

        if (!await db.BlogPosts.AnyAsync())
        {
            db.BlogPosts.AddRange(
                new BlogPost
                {
                    Title = "Launching 5S Education",
                    Slug = SlugHelper.Slugify("Launching 5S Education"),
                    Summary = "A closer look at how we build learning paths, mentor support, and outcome-focused cohorts.",
                    Content = "Welcome to 5S Education. This post shares how we design learning paths, review projects, and build job-ready skills.\n\nWe focus on clarity, measurable outcomes, and guided practice so learners stay consistent.",
                    CoverImageUrl = string.Empty,
                    AuthorName = "5S Editorial",
                    TagsCsv = "Platform, Product, Learning",
                    Locale = "en",
                    SeoTitle = "Launching 5S Education",
                    SeoDescription = "Discover how 5S Education designs cohort-based learning experiences.",
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-7),
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    UpdatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new BlogPost
                {
                    Title = "Lo trinh hoc tap danh cho nguoi moi bat dau",
                    Slug = SlugHelper.Slugify("Lo trinh hoc tap danh cho nguoi moi bat dau"),
                    Summary = "Goi y lo trinh tu HTML, CSS den du an thuc hanh, danh cho hoc vien moi.",
                    Content = "Neu ban moi bat dau, hay di theo lo trinh co cau truc: HTML/CSS nen tang, JavaScript co ban, sau do lam du an nho.\n\nQuan trong la thuc hanh deu va nhan phan hoi tu mentor.",
                    CoverImageUrl = string.Empty,
                    AuthorName = "5S Education",
                    TagsCsv = "Lo trinh, Ky nang, Huong dan",
                    Locale = "vi",
                    SeoTitle = "Lo trinh hoc tap danh cho nguoi moi bat dau",
                    SeoDescription = "Goi y lo trinh hoc tap thuc te cho nguoi moi.",
                    IsPublished = true,
                    PublishedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                }
            );
            await db.SaveChangesAsync();
        }

        await NormalizeSlugsAsync(db);
    }

    private static async Task EnsureRoleAsync(RoleManager<IdentityRole> roleManager, string role)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            var result = await roleManager.CreateAsync(new IdentityRole(role));
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
            }
        }
    }

    private static async Task<ApplicationUser> EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string firstName,
        string lastName,
        string password,
        bool resetPassword,
        bool confirmEmail)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user != null)
        {
            user.FirstName = firstName;
            user.LastName = lastName;
            if (user.CreatedAt == default)
            {
                user.CreatedAt = DateTime.UtcNow;
            }
            if (confirmEmail && !user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
            }
            await userManager.UpdateAsync(user);
            if (resetPassword)
            {
                await EnsurePasswordAsync(userManager, user, password);
            }
            return user;
        }

        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            EmailConfirmed = confirmEmail,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return user;
    }

    private static async Task EnsurePasswordAsync(UserManager<ApplicationUser> userManager, ApplicationUser user, string password)
    {
        if (await userManager.HasPasswordAsync(user))
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var result = await userManager.ResetPasswordAsync(user, token, password);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
            }

            return;
        }

        var addResult = await userManager.AddPasswordAsync(user, password);
        if (!addResult.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", addResult.Errors.Select(e => e.Description)));
        }
    }

    private static async Task EnsureUserInRoleAsync(UserManager<ApplicationUser> userManager, ApplicationUser user, string role)
    {
        if (!await userManager.IsInRoleAsync(user, role))
        {
            var result = await userManager.AddToRoleAsync(user, role);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
            }
        }
    }

    private static async Task ResetAllUserPasswordsAsync(UserManager<ApplicationUser> userManager, string password)
    {
        var users = await userManager.Users.ToListAsync();
        foreach (var user in users)
        {
            await EnsurePasswordAsync(userManager, user, password);
        }
    }

    private static async Task NormalizeSlugsAsync(ApplicationDbContext db)
    {
        var categories = await db.Categories.ToListAsync();
        var courses = await db.Courses.ToListAsync();
        var paths = await db.LearningPaths.ToListAsync();
        var posts = await db.BlogPosts.ToListAsync();
        var changed = false;

        foreach (var category in categories)
        {
            var slug = SlugHelper.Slugify(category.Title);
            if (!string.Equals(category.Slug, slug, StringComparison.Ordinal))
            {
                category.Slug = slug;
                changed = true;
            }
        }

        foreach (var course in courses)
        {
            var slug = SlugHelper.Slugify(course.Title);
            if (!string.Equals(course.Slug, slug, StringComparison.Ordinal))
            {
                course.Slug = slug;
                changed = true;
            }
        }

        foreach (var path in paths)
        {
            var slug = SlugHelper.Slugify(path.Title);
            if (!string.Equals(path.Slug, slug, StringComparison.Ordinal))
            {
                path.Slug = slug;
                changed = true;
            }
        }

        foreach (var post in posts)
        {
            var slug = SlugHelper.Slugify(post.Title);
            if (!string.Equals(post.Slug, slug, StringComparison.Ordinal))
            {
                post.Slug = slug;
                changed = true;
            }
        }

        if (changed)
        {
            await db.SaveChangesAsync();
        }
    }

    private static async Task EnsureSystemSettingsAsync(ApplicationDbContext db)
    {
        var defaults = new List<SystemSetting>
        {
            new() { Key = "siteName", Value = "5S Education", Group = "branding", Description = "Site display name" },
            new() { Key = "logoUrl", Value = "/frontend/img/logo.svg", Group = "branding", Description = "Logo image URL" },
            new() { Key = "footerTagline", Value = "Curated learning paths, expert-led classes, and hands-on projects to get you job-ready.", Group = "footer" },
            new() { Key = "footerNote", Value = "Designed for skill-first teams.", Group = "footer" },
            new() { Key = "contactEmail", Value = "hello@lumen.academy", Group = "contact" },
            new() { Key = "contactPhone", Value = "+1 (415) 555-0199", Group = "contact" },
            new() { Key = "contactAddress", Value = "San Francisco, CA", Group = "contact" },
            new() { Key = "socialFacebook", Value = "", Group = "social" },
            new() { Key = "socialLinkedIn", Value = "", Group = "social" },
            new() { Key = "socialYoutube", Value = "", Group = "social" },
            new() { Key = "cacheVersion", Value = DateTime.UtcNow.Ticks.ToString(), Group = "system" }
        };

        var existingKeys = await db.SystemSettings.Select(s => s.Key).ToListAsync();
        var missing = defaults.Where(d => !existingKeys.Contains(d.Key)).ToList();
        if (missing.Count == 0)
        {
            return;
        }

        db.SystemSettings.AddRange(missing);
        await db.SaveChangesAsync();
    }

    private static async Task<Category> EnsureCategoryAsync(ApplicationDbContext db, string title)
    {
        var slug = SlugHelper.Slugify(title);
        var existing = await db.Categories.FirstOrDefaultAsync(c => c.Slug == slug);
        if (existing != null)
        {
            if (!string.Equals(existing.Title, title, StringComparison.Ordinal))
            {
                existing.Title = title;
                await db.SaveChangesAsync();
            }
            return existing;
        }

        var category = new Category
        {
            Title = title,
            Slug = slug
        };
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return category;
    }

    private static async Task<Course> EnsureCourseAsync(
        ApplicationDbContext db,
        CourseSeed seed,
        ApplicationUser instructor,
        Category category)
    {
        var slug = SlugHelper.Slugify(seed.Title);
        var existing = await db.Courses.FirstOrDefaultAsync(c => c.Slug == slug);
        if (existing != null)
        {
            return existing;
        }

        var now = DateTime.UtcNow;
        var course = new Course
        {
            Title = seed.Title,
            Slug = slug,
            InstructorId = instructor.Id,
            CategoryId = category.Id,
            ShortDescription = seed.ShortDescription,
            Description = seed.Description,
            Outcome = seed.Outcome,
            Requirements = seed.Requirements,
            Language = seed.Language,
            Price = seed.Price,
            FlashSalePrice = seed.FlashSalePrice,
            FlashSaleStartsAt = seed.FlashSalePrice.HasValue ? now.AddDays(-1) : null,
            FlashSaleEndsAt = seed.FlashSalePrice.HasValue ? now.AddDays(14) : null,
            Level = seed.Level,
            ThumbnailUrl = "/uploads/seed-course.jpg",
            PreviewVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            IsPublished = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Courses.Add(course);
        await db.SaveChangesAsync();
        return course;
    }

    private static async Task EnsureLessonsAsync(ApplicationDbContext db, Course course, int count, int minutes)
    {
        if (await db.Lessons.AnyAsync(l => l.CourseId == course.Id))
        {
            return;
        }

        var lessons = new List<Lesson>();
        for (var i = 1; i <= count; i += 1)
        {
            lessons.Add(new Lesson
            {
                CourseId = course.Id,
                Title = $"Bài {i}",
                ContentType = "video",
                DurationMinutes = minutes,
                SortOrder = i,
                VideoUrl = course.PreviewVideoUrl
            });
        }

        db.Lessons.AddRange(lessons);
        await db.SaveChangesAsync();
    }

    private static async Task EnsureEnrollmentsAsync(ApplicationDbContext db, Course course, List<ApplicationUser> users, int take)
    {
        if (users.Count == 0)
        {
            return;
        }

        var existingUserIds = await db.Enrollments
            .Where(e => e.CourseId == course.Id)
            .Select(e => e.UserId)
            .ToListAsync();

        var toEnroll = users
            .Select(u => u.Id)
            .Where(id => !existingUserIds.Contains(id))
            .Take(take)
            .ToList();

        if (toEnroll.Count == 0)
        {
            return;
        }

        db.Enrollments.AddRange(toEnroll.Select(userId => new Enrollment
        {
            CourseId = course.Id,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        }));
        await db.SaveChangesAsync();
    }

    private static async Task EnsureReviewsAsync(ApplicationDbContext db, Course course, List<ApplicationUser> users, int count, int rating)
    {
        if (users.Count == 0)
        {
            return;
        }

        var existingReviewers = await db.Reviews
            .Where(r => r.CourseId == course.Id)
            .Select(r => r.UserId)
            .ToListAsync();

        var toReview = users
            .Where(u => !existingReviewers.Contains(u.Id))
            .Take(count)
            .ToList();

        if (toReview.Count == 0)
        {
            return;
        }

        db.Reviews.AddRange(toReview.Select(u => new Review
        {
            CourseId = course.Id,
            UserId = u.Id,
            Rating = rating,
            Comment = $"Khóa học \"{course.Title}\" rất hữu ích.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        }));
        await db.SaveChangesAsync();
    }

    private sealed class CourseSeed
    {
        public string Title { get; init; } = string.Empty;
        public string CategorySlug { get; init; } = string.Empty;
        public string InstructorEmail { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public decimal? FlashSalePrice { get; init; }
        public string Level { get; init; } = string.Empty;
        public string Language { get; init; } = string.Empty;
        public string ShortDescription { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public string Outcome { get; init; } = string.Empty;
        public string Requirements { get; init; } = string.Empty;
        public int LessonCount { get; init; }
        public int LessonMinutes { get; init; }
        public int ReviewCount { get; init; }
        public int Rating { get; init; }
    }
}
