using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminStatsService
{
    private readonly IAdminStatsRepository _repository;

    public AdminStatsService(IAdminStatsRepository repository)
    {
        _repository = repository;
    }

    public async Task<AdminStatsOverviewDto> GetOverviewAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var startDate = now.Date.AddDays(-6);
        var revenueStart = now.Date.AddDays(-29);
        var snapshot = await _repository.GetOverviewSnapshotAsync(now, cancellationToken);

        var dailyLookup = snapshot.EnrollmentCounts.ToDictionary(item => item.Date.Date, item => item.Count);
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

        var revenueLookup = snapshot.RevenueValues.ToDictionary(item => item.Date.Date, item => item.Value);
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

        return new AdminStatsOverviewDto
        {
            TotalUsers = snapshot.TotalUsers,
            TotalCourses = snapshot.TotalCourses,
            PublishedCourses = snapshot.PublishedCourses,
            TotalLessons = snapshot.TotalLessons,
            TotalEnrollments = snapshot.TotalEnrollments,
            OpenSupportTickets = snapshot.OpenSupportTickets,
            ActiveStudents30d = snapshot.ActiveStudents30d,
            TotalRevenue = snapshot.TotalRevenue,
            AverageRating = snapshot.AverageRating,
            EnrollmentsLast7Days = dailyCounts,
            RevenueLast30Days = revenueDaily,
            OrdersByStatus = snapshot.OrdersByStatus,
            TopCoursesByRevenue = snapshot.TopCoursesByRevenue
        };
    }
}
