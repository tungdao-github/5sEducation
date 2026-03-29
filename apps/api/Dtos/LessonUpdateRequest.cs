using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class LessonUpdateRequest
{
    [Required, MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string ContentType { get; set; } = "video";

    [Range(0.3, 180.0)]
    public double DurationMinutes { get; set; }

    [MaxLength(200)]
    public string VideoUrl { get; set; } = string.Empty;

    [MaxLength(500)]
    public string ExerciseQuestion { get; set; } = string.Empty;

    [MaxLength(200)]
    public string ExerciseOptionA { get; set; } = string.Empty;

    [MaxLength(200)]
    public string ExerciseOptionB { get; set; } = string.Empty;

    [MaxLength(200)]
    public string ExerciseOptionC { get; set; } = string.Empty;

    [MaxLength(200)]
    public string ExerciseOptionD { get; set; } = string.Empty;

    [Range(1, 4)]
    public int? ExerciseCorrectOption { get; set; }

    [MaxLength(500)]
    public string ExerciseExplanation { get; set; } = string.Empty;

    [Range(1, 100)]
    public int ExercisePassingPercent { get; set; } = 80;

    [Range(0, 180)]
    public int ExerciseTimeLimitMinutes { get; set; }

    [Range(0, 20)]
    public int ExerciseMaxTabSwitches { get; set; } = 2;

    public List<LessonExerciseQuestionInputDto> ExerciseQuestions { get; set; } = new();

    [Range(0, 1000)]
    public int SortOrder { get; set; }
}
