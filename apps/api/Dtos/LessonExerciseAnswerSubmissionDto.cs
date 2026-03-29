using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class LessonExerciseAnswerSubmissionDto
{
    [Range(1, int.MaxValue)]
    public int QuestionId { get; set; }

    [Range(1, 4)]
    public int SelectedOption { get; set; }
}
