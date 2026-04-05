namespace UdemyClone.Api.Dtos;

public class TopCourseRevenueDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}
