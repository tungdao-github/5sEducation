using System.Collections.Generic;

namespace UdemyClone.Api.Dtos;

public class AdminStatsOverviewDto
{
    public int TotalUsers { get; set; }
    public int TotalCourses { get; set; }
    public int PublishedCourses { get; set; }
    public int TotalEnrollments { get; set; }
    public int TotalLessons { get; set; }
    public int OpenSupportTickets { get; set; }
    public int ActiveStudents30d { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageRating { get; set; }
    public List<DailyCountDto> EnrollmentsLast7Days { get; set; } = new();
    public List<DailyValueDto> RevenueLast30Days { get; set; } = new();
    public List<StatusCountDto> OrdersByStatus { get; set; } = new();
    public List<TopCourseRevenueDto> TopCoursesByRevenue { get; set; } = new();
}
