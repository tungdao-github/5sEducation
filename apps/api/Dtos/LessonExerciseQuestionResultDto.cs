namespace UdemyClone.Api.Dtos;

public class LessonExerciseQuestionResultDto
{
    public int QuestionId { get; set; }
    public string Question { get; set; } = string.Empty;
    public int SelectedOption { get; set; }
    public int CorrectOption { get; set; }
    public bool IsCorrect { get; set; }
    public string Explanation { get; set; } = string.Empty;
}
