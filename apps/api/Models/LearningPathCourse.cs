namespace UdemyClone.Api.Models;

public class LearningPathCourse
{
    public int Id { get; set; }

    public int LearningPathId { get; set; }

    public int? LearningPathSectionId { get; set; }

    public int CourseId { get; set; }

    public int SortOrder { get; set; }

    public bool IsRequired { get; set; } = true;

    public LearningPath? LearningPath { get; set; }

    public LearningPathSection? LearningPathSection { get; set; }

    public Course? Course { get; set; }
}
