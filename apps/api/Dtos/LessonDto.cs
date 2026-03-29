namespace UdemyClone.Api.Dtos;

public class LessonDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ContentType { get; set; } = "video";
    public double DurationMinutes { get; set; }
    public string VideoUrl { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool HasExercise { get; set; }
    public LessonExerciseDto? Exercise { get; set; }
}
