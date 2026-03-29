namespace UdemyClone.Api.Dtos;

public class CourseDetailDto : CourseListDto
{
    public string Description { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string PreviewVideoUrl { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<LessonDto> Lessons { get; set; } = new();
}
