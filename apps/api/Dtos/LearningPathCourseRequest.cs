using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class LearningPathCourseRequest
{
    [Range(1, int.MaxValue)]
    public int CourseId { get; set; }

    [Range(1, int.MaxValue)]
    public int? LearningPathSectionId { get; set; }

    [Range(0, 1000)]
    public int SortOrder { get; set; }

    public bool IsRequired { get; set; } = true;
}
