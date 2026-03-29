namespace UdemyClone.Api.Dtos;

public class LearningPathCourseDto
{
    public int Id { get; set; }

    public int LearningPathId { get; set; }

    public int? LearningPathSectionId { get; set; }

    public int CourseId { get; set; }

    public string CourseTitle { get; set; } = string.Empty;

    public string CourseSlug { get; set; } = string.Empty;

    public string CourseThumbnailUrl { get; set; } = string.Empty;

    public string CourseLevel { get; set; } = string.Empty;

    public string CourseLanguage { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsRequired { get; set; }
}
