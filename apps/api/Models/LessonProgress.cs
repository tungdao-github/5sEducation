using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class LessonProgress
{
    public int Id { get; set; }

    [Required]
    public int EnrollmentId { get; set; }
    public Enrollment? Enrollment { get; set; }

    [Required]
    public int LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
