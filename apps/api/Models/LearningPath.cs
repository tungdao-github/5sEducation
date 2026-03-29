namespace UdemyClone.Api.Models;

public class LearningPath
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Level { get; set; } = string.Empty;

    public string ThumbnailUrl { get; set; } = string.Empty;

    public int EstimatedHours { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<LearningPathSection> Sections { get; set; } = new List<LearningPathSection>();

    public ICollection<LearningPathCourse> Courses { get; set; } = new List<LearningPathCourse>();
}
