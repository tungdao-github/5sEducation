namespace UdemyClone.Api.Dtos;

public class ProgressSnapshotDto
{
    public int CourseId { get; set; }
    public int? LastLessonId { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public double ProgressPercent { get; set; }
    public List<int> CompletedLessonIds { get; set; } = new();
}
