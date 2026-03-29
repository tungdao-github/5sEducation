namespace UdemyClone.Api.Dtos;

public class LessonExerciseResultDto
{
    public bool IsCorrect { get; set; }
    public bool Passed { get; set; }
    public int AttemptCount { get; set; }
    public double ScorePercent { get; set; }
    public int PassingPercent { get; set; }
    public int CorrectAnswers { get; set; }
    public int TotalQuestions { get; set; }
    public int TimeSpentSeconds { get; set; }
    public int AllowedTimeSeconds { get; set; }
    public bool TimedOut { get; set; }
    public int TabSwitchCount { get; set; }
    public int AllowedTabSwitches { get; set; }
    public bool TabViolation { get; set; }
    public string MessageCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<LessonExerciseQuestionResultDto> QuestionResults { get; set; } = new();
}
