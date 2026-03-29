namespace UdemyClone.Api.Models;

public class LearningPathSection
{
    public int Id { get; set; }

    public int LearningPathId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public LearningPath? LearningPath { get; set; }

    public ICollection<LearningPathCourse> Courses { get; set; } = new List<LearningPathCourse>();
}
