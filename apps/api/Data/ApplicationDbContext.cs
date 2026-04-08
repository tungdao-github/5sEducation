using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonExerciseQuestion> LessonExerciseQuestions => Set<LessonExerciseQuestion>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<LessonExerciseAttempt> LessonExerciseAttempts => Set<LessonExerciseAttempt>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<CourseViewHistory> CourseViewHistories => Set<CourseViewHistory>();
    public DbSet<LearningPath> LearningPaths => Set<LearningPath>();
    public DbSet<LearningPathSection> LearningPathSections => Set<LearningPathSection>();
    public DbSet<LearningPathCourse> LearningPathCourses => Set<LearningPathCourse>();
    public DbSet<HomePageBlock> HomePageBlocks => Set<HomePageBlock>();
    public DbSet<SupportMessage> SupportMessages => Set<SupportMessage>();
    public DbSet<SupportReply> SupportReplies => Set<SupportReply>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<BlogComment> BlogComments => Set<BlogComment>();
    public DbSet<BlogCommentLike> BlogCommentLikes => Set<BlogCommentLike>();
    public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();
    public DbSet<UserAddress> UserAddresses => Set<UserAddress>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Category>(entity =>
        {
            entity.HasIndex(c => c.Slug).IsUnique();
        });

        builder.Entity<Course>(entity =>
        {
            entity.HasIndex(c => c.Slug).IsUnique();
            entity.HasOne(c => c.Instructor)
                .WithMany()
                .HasForeignKey(c => c.InstructorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Lesson>(entity =>
        {
            entity.Property(l => l.ContentType)
                .HasDefaultValue("video");

            entity.Property(l => l.ExercisePassingPercent)
                .HasDefaultValue(80);

            entity.Property(l => l.ExerciseTimeLimitSeconds)
                .HasDefaultValue(0);

            entity.Property(l => l.ExerciseMaxTabSwitches)
                .HasDefaultValue(2);

            entity.HasOne(l => l.Course)
                .WithMany(c => c.Lessons)
                .HasForeignKey(l => l.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<LessonExerciseQuestion>(entity =>
        {
            entity.HasIndex(q => new { q.LessonId, q.SortOrder });
            entity.HasOne(q => q.Lesson)
                .WithMany(l => l.ExerciseQuestions)
                .HasForeignKey(q => q.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Enrollment>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
            entity.HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<LessonProgress>(entity =>
        {
            entity.HasIndex(lp => new { lp.EnrollmentId, lp.LessonId }).IsUnique();
            entity.HasOne(lp => lp.Enrollment)
                .WithMany(e => e.LessonProgresses)
                .HasForeignKey(lp => lp.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(lp => lp.Lesson)
                .WithMany()
                .HasForeignKey(lp => lp.LessonId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        builder.Entity<LessonExerciseAttempt>(entity =>
        {
            entity.HasIndex(lea => new { lea.EnrollmentId, lea.LessonId });
            entity.HasIndex(lea => new { lea.EnrollmentId, lea.LessonId, lea.AttemptedAt });
            entity.HasOne(lea => lea.Enrollment)
                .WithMany(e => e.LessonExerciseAttempts)
                .HasForeignKey(lea => lea.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(lea => lea.Lesson)
                .WithMany()
                .HasForeignKey(lea => lea.LessonId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        builder.Entity<CartItem>(entity =>
        {
            entity.HasIndex(c => new { c.UserId, c.CourseId }).IsUnique();
        });

        builder.Entity<Order>(entity =>
        {
            entity.Property(o => o.Status)
                .HasMaxLength(20)
                .HasDefaultValue("paid");
            entity.Property(o => o.Subtotal)
                .HasPrecision(18, 2);
            entity.Property(o => o.DiscountTotal)
                .HasPrecision(18, 2);
            entity.Property(o => o.Total)
                .HasPrecision(18, 2);
            entity.Property(o => o.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("USD");
            entity.HasIndex(o => new { o.UserId, o.CreatedAt });
            entity.HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<OrderItem>(entity =>
        {
            entity.Property(i => i.UnitPrice)
                .HasPrecision(18, 2);
            entity.Property(i => i.LineTotal)
                .HasPrecision(18, 2);
            entity.HasIndex(i => new { i.OrderId, i.CourseId });
            entity.HasOne(i => i.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Review>(entity =>
        {
            entity.HasIndex(r => new { r.UserId, r.CourseId }).IsUnique();
            entity.HasOne(r => r.Course)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BlogComment>(entity =>
        {
            entity.HasIndex(c => new { c.BlogPostId, c.CreatedAt });
            entity.HasOne(c => c.BlogPost)
                .WithMany()
                .HasForeignKey(c => c.BlogPostId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BlogCommentLike>(entity =>
        {
            entity.HasIndex(l => new { l.BlogCommentId, l.UserId }).IsUnique();
            entity.HasOne(l => l.BlogComment)
                .WithMany(c => c.Likes)
                .HasForeignKey(l => l.BlogCommentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(l => l.User)
                .WithMany()
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        builder.Entity<WishlistItem>(entity =>
        {
            entity.HasIndex(w => new { w.UserId, w.CourseId }).IsUnique();
            entity.HasOne(w => w.Course)
                .WithMany()
                .HasForeignKey(w => w.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Coupon>(entity =>
        {
            entity.HasIndex(c => c.Code).IsUnique();
            entity.Property(c => c.Value).HasPrecision(18, 2);
            entity.Property(c => c.MinOrder).HasPrecision(18, 2);
        });

        builder.Entity<CourseViewHistory>(entity =>
        {
            entity.HasIndex(h => new { h.UserId, h.CourseId }).IsUnique();
            entity.HasIndex(h => new { h.UserId, h.ViewedAt });
            entity.HasOne(h => h.Course)
                .WithMany()
                .HasForeignKey(h => h.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(h => h.User)
                .WithMany()
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<LearningPath>(entity =>
        {
            entity.HasIndex(p => p.Slug).IsUnique();
        });

        builder.Entity<LearningPathSection>(entity =>
        {
            entity.HasIndex(s => new { s.LearningPathId, s.SortOrder });
            entity.HasOne(s => s.LearningPath)
                .WithMany(p => p.Sections)
                .HasForeignKey(s => s.LearningPathId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<LearningPathCourse>(entity =>
        {
            entity.HasIndex(pc => new { pc.LearningPathId, pc.SortOrder });
            entity.HasOne(pc => pc.LearningPath)
                .WithMany(p => p.Courses)
                .HasForeignKey(pc => pc.LearningPathId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(pc => pc.LearningPathSection)
                .WithMany(s => s.Courses)
                .HasForeignKey(pc => pc.LearningPathSectionId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(pc => pc.Course)
                .WithMany()
                .HasForeignKey(pc => pc.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<HomePageBlock>(entity =>
        {
            entity.HasIndex(b => b.Key);
            entity.HasIndex(b => new { b.Locale, b.SortOrder });
        });

        builder.Entity<SupportMessage>(entity =>
        {
            entity.Property(m => m.Name)
                .HasMaxLength(200);
            entity.Property(m => m.Email)
                .HasMaxLength(256);
            entity.Property(m => m.Status)
                .HasMaxLength(20)
                .HasDefaultValue("open");
            entity.HasIndex(m => m.Status);
            entity.HasIndex(m => m.CreatedAt);
            entity.HasIndex(m => m.UserId);
            entity.HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<SupportReply>(entity =>
        {
            entity.Property(r => r.AuthorRole)
                .HasMaxLength(20);
            entity.Property(r => r.AuthorName)
                .HasMaxLength(200);
            entity.HasIndex(r => new { r.SupportMessageId, r.CreatedAt });
            entity.HasOne(r => r.SupportMessage)
                .WithMany()
                .HasForeignKey(r => r.SupportMessageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BlogPost>(entity =>
        {
            entity.Property(p => p.Title)
                .HasMaxLength(200);
            entity.Property(p => p.Slug)
                .HasMaxLength(200);
            entity.Property(p => p.Summary)
                .HasMaxLength(500);
            entity.Property(p => p.AuthorName)
                .HasMaxLength(160);
            entity.Property(p => p.TagsCsv)
                .HasMaxLength(500);
            entity.Property(p => p.Locale)
                .HasMaxLength(10)
                .HasDefaultValue("en");
            entity.Property(p => p.SeoTitle)
                .HasMaxLength(200);
            entity.Property(p => p.SeoDescription)
                .HasMaxLength(1000);
            entity.HasIndex(p => p.Slug)
                .IsUnique();
            entity.HasIndex(p => new { p.Locale, p.IsPublished });
            entity.HasIndex(p => p.PublishedAt);
        });

        builder.Entity<AdminAuditLog>(entity =>
        {
            entity.Property(a => a.UserEmail)
                .HasMaxLength(256);
            entity.Property(a => a.Action)
                .HasMaxLength(200);
            entity.Property(a => a.Method)
                .HasMaxLength(10);
            entity.Property(a => a.Path)
                .HasMaxLength(260);
            entity.Property(a => a.QueryString)
                .HasMaxLength(260);
            entity.Property(a => a.IpAddress)
                .HasMaxLength(64);
            entity.Property(a => a.UserAgent)
                .HasMaxLength(300);
            entity.HasIndex(a => new { a.UserId, a.CreatedAt });
            entity.HasIndex(a => a.CreatedAt);
        });

        builder.Entity<UserAddress>(entity =>
        {
            entity.Property(a => a.Label)
                .HasMaxLength(120);
            entity.Property(a => a.RecipientName)
                .HasMaxLength(200);
            entity.Property(a => a.Phone)
                .HasMaxLength(30);
            entity.Property(a => a.Line1)
                .HasMaxLength(200);
            entity.Property(a => a.Line2)
                .HasMaxLength(200);
            entity.Property(a => a.City)
                .HasMaxLength(120);
            entity.Property(a => a.State)
                .HasMaxLength(120);
            entity.Property(a => a.PostalCode)
                .HasMaxLength(30);
            entity.Property(a => a.Country)
                .HasMaxLength(120);
            entity.HasIndex(a => new { a.UserId, a.IsDefault });
            entity.HasIndex(a => a.UserId);
            entity.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<SystemSetting>(entity =>
        {
            entity.Property(s => s.Key)
                .HasMaxLength(120);
            entity.Property(s => s.Value)
                .HasMaxLength(2000);
            entity.Property(s => s.Group)
                .HasMaxLength(120);
            entity.Property(s => s.Description)
                .HasMaxLength(300);
            entity.HasIndex(s => s.Key).IsUnique();
            entity.HasIndex(s => s.Group);
        });
    }
}
