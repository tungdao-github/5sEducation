using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Repositories;

public interface IAdminStatsRepository
{
    Task<AdminStatsOverviewSnapshot> GetOverviewSnapshotAsync(DateTime now, CancellationToken cancellationToken = default);
}

public sealed class AdminStatsOverviewSnapshot
{
    public int TotalUsers { get; init; }
    public int TotalCourses { get; init; }
    public int PublishedCourses { get; init; }
    public int TotalLessons { get; init; }
    public int TotalEnrollments { get; init; }
    public int OpenSupportTickets { get; init; }
    public int ActiveStudents30d { get; init; }
    public decimal TotalRevenue { get; init; }
    public double AverageRating { get; init; }
    public List<DailyCountRaw> EnrollmentCounts { get; init; } = [];
    public List<DailyValueRaw> RevenueValues { get; init; } = [];
    public List<StatusCountDto> OrdersByStatus { get; init; } = [];
    public List<TopCourseRevenueDto> TopCoursesByRevenue { get; init; } = [];
}

public sealed class DailyCountRaw
{
    public DateTime Date { get; init; }
    public int Count { get; init; }
}

public sealed class DailyValueRaw
{
    public DateTime Date { get; init; }
    public decimal Value { get; init; }
}

public sealed class AdminStatsRepository : IAdminStatsRepository
{
    private readonly ApplicationDbContext _db;

    public AdminStatsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<AdminStatsOverviewSnapshot> GetOverviewSnapshotAsync(DateTime now, CancellationToken cancellationToken = default)
    {
        var startDate = now.Date.AddDays(-6);
        var revenueStart = now.Date.AddDays(-29);
        var since30d = now.Date.AddDays(-30);

        var totalUsersTask = _db.Users.CountAsync(cancellationToken);
        var totalCoursesTask = _db.Courses.CountAsync(cancellationToken);
        var publishedCoursesTask = _db.Courses.CountAsync(c => c.IsPublished, cancellationToken);
        var totalLessonsTask = _db.Lessons.CountAsync(cancellationToken);
        var totalEnrollmentsTask = _db.Enrollments.CountAsync(cancellationToken);
        var openSupportTask = _db.SupportMessages.CountAsync(m => m.Status == "open", cancellationToken);
        var averageRatingTask = _db.Reviews.AsNoTracking().Select(r => (double?)r.Rating).AverageAsync(cancellationToken);

        var revenueTask = _db.Orders
            .Where(o => o.Status == "paid")
            .AsNoTracking()
            .Select(o => o.Total)
            .SumAsync(cancellationToken);

        var activeStudentsTask = _db.Enrollments
            .Where(e => e.CreatedAt >= since30d)
            .AsNoTracking()
            .Select(e => e.UserId)
            .Distinct()
            .CountAsync(cancellationToken);

        var dailyRawTask = _db.Enrollments
            .Where(e => e.CreatedAt >= startDate)
            .GroupBy(e => e.CreatedAt.Date)
            .AsNoTracking()
            .Select(group => new DailyCountRaw
            {
                Date = group.Key,
                Count = group.Count()
            })
            .ToListAsync(cancellationToken);

        var revenueDailyTask = _db.Orders
            .Where(o => o.Status == "paid" && o.CreatedAt >= revenueStart)
            .GroupBy(o => o.CreatedAt.Date)
            .AsNoTracking()
            .Select(group => new DailyValueRaw
            {
                Date = group.Key,
                Value = group.Sum(o => o.Total)
            })
            .ToListAsync(cancellationToken);

        var ordersByStatusTask = _db.Orders
            .GroupBy(o => o.Status)
            .AsNoTracking()
            .Select(group => new StatusCountDto
            {
                Status = group.Key,
                Count = group.Count()
            })
            .ToListAsync(cancellationToken);

        var topCoursesTask = _db.OrderItems
            .Where(item => item.Order != null && item.Order.Status == "paid")
            .GroupBy(item => new { item.CourseId, item.CourseTitle })
            .AsNoTracking()
            .Select(group => new TopCourseRevenueDto
            {
                CourseId = group.Key.CourseId,
                CourseTitle = group.Key.CourseTitle,
                Revenue = group.Sum(item => item.LineTotal),
                Orders = group.Select(item => item.OrderId).Distinct().Count()
            })
            .OrderByDescending(item => item.Revenue)
            .Take(5)
            .ToListAsync(cancellationToken);

        await Task.WhenAll(
            totalUsersTask,
            totalCoursesTask,
            publishedCoursesTask,
            totalLessonsTask,
            totalEnrollmentsTask,
            openSupportTask,
            averageRatingTask,
            revenueTask,
            activeStudentsTask,
            dailyRawTask,
            revenueDailyTask,
            ordersByStatusTask,
            topCoursesTask);

        return new AdminStatsOverviewSnapshot
        {
            TotalUsers = totalUsersTask.Result,
            TotalCourses = totalCoursesTask.Result,
            PublishedCourses = publishedCoursesTask.Result,
            TotalLessons = totalLessonsTask.Result,
            TotalEnrollments = totalEnrollmentsTask.Result,
            OpenSupportTickets = openSupportTask.Result,
            ActiveStudents30d = activeStudentsTask.Result,
            TotalRevenue = revenueTask.Result,
            AverageRating = averageRatingTask.Result ?? 0,
            EnrollmentCounts = dailyRawTask.Result,
            RevenueValues = revenueDailyTask.Result,
            OrdersByStatus = ordersByStatusTask.Result,
            TopCoursesByRevenue = topCoursesTask.Result
        };
    }
}
