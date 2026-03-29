using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class LessonExerciseQuestion
{
    public int Id { get; set; }

    [Required]
    public int LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    [Required, MaxLength(500)]
    public string Question { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string OptionA { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string OptionB { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string OptionC { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string OptionD { get; set; } = string.Empty;

    [Range(1, 4)]
    public int CorrectOption { get; set; }

    [MaxLength(500)]
    public string Explanation { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
