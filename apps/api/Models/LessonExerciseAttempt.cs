using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class LessonExerciseAttempt
{
    public int Id { get; set; }

    [Required]
    public int EnrollmentId { get; set; }
    public Enrollment? Enrollment { get; set; }

    [Required]
    public int LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    [Range(1, 4)]
    public int? SelectedOption { get; set; }

    public bool IsCorrect { get; set; }

    [Range(0, 100)]
    public double ScorePercent { get; set; }

    public int CorrectAnswers { get; set; }

    public int TotalQuestions { get; set; }

    public bool Passed { get; set; }

    [Range(0, 86400)]
    public int TimeSpentSeconds { get; set; }

    [Range(0, 86400)]
    public int AllowedTimeSeconds { get; set; }

    public bool TimedOut { get; set; }

    [Range(0, 50)]
    public int TabSwitchCount { get; set; }

    [Range(0, 50)]
    public int AllowedTabSwitches { get; set; }

    public bool TabViolation { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    public string AnswersJson { get; set; } = string.Empty;

    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
}
