namespace UdemyClone.Api.Dtos;

public class PublicStatsDto
{
    public int TotalCourses { get; set; }
    public int TotalStudents { get; set; }
    public int TotalInstructors { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
}
