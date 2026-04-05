using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = "Admin")]
public class AdminStatsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminStatsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<AdminStatsOverviewDto>> GetOverview()
    {
        var now = DateTime.UtcNow;
        var startDate = now.Date.AddDays(-6);
        var revenueStart = now.Date.AddDays(-29);
        var since30d = now.Date.AddDays(-30);

        var totalUsersTask = _db.Users.CountAsync();
        var totalCoursesTask = _db.Courses.CountAsync();
        var publishedCoursesTask = _db.Courses.CountAsync(c => c.IsPublished);
        var totalLessonsTask = _db.Lessons.CountAsync();
        var totalEnrollmentsTask = _db.Enrollments.CountAsync();
        var openSupportTask = _db.SupportMessages.CountAsync(m => m.Status == "open");
        var averageRatingTask = _db.Reviews.Select(r => (double?)r.Rating).AverageAsync();

        var revenueTask = _db.Orders
            .Where(o => o.Status == "paid")
            .Select(o => o.Total)
            .SumAsync();

        var activeStudentsTask = _db.Enrollments
            .Where(e => e.CreatedAt >= since30d)
            .Select(e => e.UserId)
            .Distinct()
            .CountAsync();

        var dailyRawTask = _db.Enrollments
            .Where(e => e.CreatedAt >= startDate)
            .GroupBy(e => e.CreatedAt.Date)
            .Select(group => new
            {
                Date = group.Key,
                Count = group.Count()
            })
            .ToListAsync();

        var revenueDailyTask = _db.Orders
            .Where(o => o.Status == "paid" && o.CreatedAt >= revenueStart)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(group => new
            {
                Date = group.Key,
                Value = group.Sum(o => o.Total)
            })
            .ToListAsync();

        var ordersByStatusTask = _db.Orders
            .GroupBy(o => o.Status)
            .Select(group => new StatusCountDto
            {
                Status = group.Key,
                Count = group.Count()
            })
            .ToListAsync();

        var topCoursesTask = _db.OrderItems
            .Where(item => item.Order != null && item.Order.Status == "paid")
            .GroupBy(item => new { item.CourseId, item.CourseTitle })
            .Select(group => new TopCourseRevenueDto
            {
                CourseId = group.Key.CourseId,
                CourseTitle = group.Key.CourseTitle,
                Revenue = group.Sum(item => item.LineTotal),
                Orders = group.Select(item => item.OrderId).Distinct().Count()
            })
            .OrderByDescending(item => item.Revenue)
            .Take(5)
            .ToListAsync();

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
            topCoursesTask
        );

        var dailyLookup = dailyRawTask.Result
            .ToDictionary(item => item.Date.Date, item => item.Count);

        var dailyCounts = new List<DailyCountDto>();
        for (var i = 0; i < 7; i++)
        {
            var day = startDate.AddDays(i);
            dailyCounts.Add(new DailyCountDto
            {
                Date = day.ToString("yyyy-MM-dd"),
                Count = dailyLookup.TryGetValue(day, out var count) ? count : 0
            });
        }

        var revenueLookup = revenueDailyTask.Result
            .ToDictionary(item => item.Date.Date, item => item.Value);

        var revenueDaily = new List<DailyValueDto>();
        for (var i = 0; i < 30; i++)
        {
            var day = revenueStart.AddDays(i);
            revenueDaily.Add(new DailyValueDto
            {
                Date = day.ToString("yyyy-MM-dd"),
                Value = revenueLookup.TryGetValue(day, out var value) ? value : 0
            });
        }

        return Ok(new AdminStatsOverviewDto
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
            EnrollmentsLast7Days = dailyCounts,
            RevenueLast30Days = revenueDaily,
            OrdersByStatus = ordersByStatusTask.Result,
            TopCoursesByRevenue = topCoursesTask.Result
        });
    }
}
