using System.Text.Json;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public static class LessonExerciseSubmissionHelper
{
    public static LessonExerciseSubmissionPlan BuildPlan(
        LessonExerciseSubmissionRequest request,
        IReadOnlyList<LessonExerciseHelper.ExerciseQuestionData> questions,
        int passingPercent,
        int timeLimitSeconds,
        int maxTabSwitches,
        DateTime submittedAt)
    {
        var answerLookup = request.Answers
            .Where(a => a.QuestionId != 0 && a.SelectedOption is >= 1 and <= 4)
            .GroupBy(a => a.QuestionId)
            .ToDictionary(g => g.Key, g => g.Last().SelectedOption);

        if (answerLookup.Count == 0 && request.SelectedOption is >= 1 and <= 4 && questions.Count > 0)
        {
            answerLookup[questions[0].Id] = request.SelectedOption.Value;
        }

        var questionResults = questions
            .OrderBy(q => q.SortOrder)
            .Select(q =>
            {
                var selectedOption = answerLookup.TryGetValue(q.Id, out var selected) ? selected : 0;
                var isCorrect = selectedOption == q.CorrectOption;

                return new LessonExerciseQuestionResultDto
                {
                    QuestionId = q.Id,
                    Question = q.Question,
                    SelectedOption = selectedOption,
                    CorrectOption = q.CorrectOption,
                    IsCorrect = isCorrect,
                    Explanation = q.Explanation
                };
            })
            .ToList();

        var totalQuestions = questionResults.Count;
        var correctAnswers = questionResults.Count(r => r.IsCorrect);
        var scorePercent = totalQuestions == 0
            ? 0
            : Math.Round(correctAnswers * 100d / totalQuestions, 2, MidpointRounding.AwayFromZero);

        var passingThreshold = LessonExerciseHelper.NormalizePassingPercent(passingPercent);
        var allowedTimeSeconds = LessonExerciseHelper.NormalizeTimeLimitSeconds(timeLimitSeconds);
        var allowedTabSwitches = LessonExerciseHelper.NormalizeMaxTabSwitches(maxTabSwitches);
        var tabSwitchCount = Math.Max(0, request.TabSwitchCount);

        var startedAt = request.StartedAtUtc?.ToUniversalTime() ?? submittedAt;
        if (startedAt > submittedAt)
        {
            startedAt = submittedAt;
        }

        var minimumStartedAt = submittedAt.AddHours(-6);
        if (startedAt < minimumStartedAt)
        {
            startedAt = minimumStartedAt;
        }

        var timeSpentSeconds = Math.Max(0, (int)Math.Round((submittedAt - startedAt).TotalSeconds));
        var timedOut = allowedTimeSeconds > 0 && timeSpentSeconds > allowedTimeSeconds;
        var tabViolation = tabSwitchCount > allowedTabSwitches;
        var passed = scorePercent >= passingThreshold && !timedOut && !tabViolation;

        var messageCode = passed
            ? "passed"
            : timedOut
                ? "timed_out"
                : tabViolation
                    ? "tab_violation"
                    : "failed";

        var legacySelectedOption = questionResults
            .Select(r => (int?)r.SelectedOption)
            .FirstOrDefault(v => v is >= 1 and <= 4);

        return new LessonExerciseSubmissionPlan(
            questionResults,
            scorePercent,
            correctAnswers,
            totalQuestions,
            passingThreshold,
            allowedTimeSeconds,
            allowedTabSwitches,
            tabSwitchCount,
            timeSpentSeconds,
            startedAt,
            submittedAt,
            timedOut,
            tabViolation,
            passed,
            messageCode,
            legacySelectedOption);
    }

    public static string SerializeAttemptAnswers(IReadOnlyList<LessonExerciseQuestionResultDto> questionResults)
    {
        return JsonSerializer.Serialize(questionResults.Select(r => new
        {
            r.QuestionId,
            r.SelectedOption,
            r.CorrectOption,
            r.IsCorrect
        }));
    }
}

public sealed record LessonExerciseSubmissionPlan(
    List<LessonExerciseQuestionResultDto> QuestionResults,
    double ScorePercent,
    int CorrectAnswers,
    int TotalQuestions,
    int PassingPercent,
    int AllowedTimeSeconds,
    int AllowedTabSwitches,
    int TabSwitchCount,
    int TimeSpentSeconds,
    DateTime StartedAt,
    DateTime SubmittedAt,
    bool TimedOut,
    bool TabViolation,
    bool Passed,
    string MessageCode,
    int? LegacySelectedOption);
