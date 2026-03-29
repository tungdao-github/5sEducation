using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class Enrollment
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    [Required]
    public int CourseId { get; set; }
    public Course? Course { get; set; }

    public int? LastLessonId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public ICollection<LessonExerciseAttempt> LessonExerciseAttempts { get; set; } = new List<LessonExerciseAttempt>();
}
