using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class ProgressUpdateRequest
{
    [Required, Range(1, int.MaxValue)]
    public int CourseId { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int LessonId { get; set; }

    public bool? IsCompleted { get; set; }
    public bool SetAsLast { get; set; } = true;
}
