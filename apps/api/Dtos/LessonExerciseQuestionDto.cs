namespace UdemyClone.Api.Dtos;

public class LessonExerciseQuestionDto
{
    public int Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
