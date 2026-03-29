namespace UdemyClone.Api.Dtos;

public class LearningPathListDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Level { get; set; } = string.Empty;

    public string ThumbnailUrl { get; set; } = string.Empty;

    public int EstimatedHours { get; set; }

    public int CourseCount { get; set; }

    public bool IsPublished { get; set; }

    public int? EnrolledCourseCount { get; set; }

    public int? ProgressPercent { get; set; }
}
