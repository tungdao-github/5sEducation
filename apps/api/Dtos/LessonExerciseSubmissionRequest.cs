using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class LessonExerciseSubmissionRequest
{
    [Range(1, 4)]
    public int? SelectedOption { get; set; }

    public List<LessonExerciseAnswerSubmissionDto> Answers { get; set; } = new();

    public DateTime? StartedAtUtc { get; set; }

    [Range(0, 50)]
    public int TabSwitchCount { get; set; }
}
