namespace UdemyClone.Api.Dtos;

public class LessonExerciseStatusDto
{
    public int LessonId { get; set; }
    public bool Passed { get; set; }
    public int AttemptCount { get; set; }
    public double BestScorePercent { get; set; }
    public double? LastScorePercent { get; set; }
    public int? LastCorrectAnswers { get; set; }
    public int? LastTotalQuestions { get; set; }
    public bool? LastPassed { get; set; }
    public bool? LastTimedOut { get; set; }
    public bool? LastTabViolation { get; set; }
    public int? LastTabSwitchCount { get; set; }
    public int PassingPercent { get; set; }
    public int TimeLimitSeconds { get; set; }
    public int MaxTabSwitches { get; set; }
    public DateTime? LastAttemptedAt { get; set; }
}
