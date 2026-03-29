namespace UdemyClone.Api.Dtos;

public class LessonExerciseDto
{
    public int PassingPercent { get; set; } = 80;
    public int TimeLimitSeconds { get; set; }
    public int MaxTabSwitches { get; set; } = 2;
    public List<LessonExerciseQuestionDto> Questions { get; set; } = new();
}
