using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class LessonExerciseQuestionInputDto
{
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
}
