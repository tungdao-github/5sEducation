namespace UdemyClone.Api.Dtos;

public class EnrollmentDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string CourseSlug { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int? LastLessonId { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public double ProgressPercent { get; set; }
}
