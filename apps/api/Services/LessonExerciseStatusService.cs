using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class LessonExerciseStatusService
{
    private readonly ILessonsRepository _repository;

    public LessonExerciseStatusService(ILessonsRepository repository)
    {
        _repository = repository;
    }

    public async Task<AdminCrudResult<LessonExerciseStatusDto>> GetExerciseStatusAsync(
        string userId,
        int lessonId,
        CancellationToken cancellationToken = default)
    {
        var lesson = await _repository.FindWithDetailsAsync(lessonId, cancellationToken);
        if (lesson is null)
        {
            return AdminCrudResult<LessonExerciseStatusDto>.NotFound();
        }

        if (!LessonExerciseHelper.IsExerciseConfigured(lesson))
        {
            return AdminCrudResult<LessonExerciseStatusDto>.BadRequest("This lesson does not have an exercise.");
        }

        var enrollment = await _repository.FindEnrollmentAsync(userId, lesson.CourseId, includeProgresses: false, cancellationToken: cancellationToken);
        if (enrollment is null)
        {
            return AdminCrudResult<LessonExerciseStatusDto>.Forbidden();
        }

        var attemptCount = await _repository.CountAttemptsAsync(enrollment.Id, lesson.Id, cancellationToken);
        var passed = await _repository.HasPassedAttemptAsync(enrollment.Id, lesson.Id, cancellationToken);
        var latestAttempt = await _repository.FindLatestAttemptAsync(enrollment.Id, lesson.Id, cancellationToken);
        var bestScore = await _repository.GetBestScoreAsync(enrollment.Id, lesson.Id, cancellationToken);

        double? latestScore = latestAttempt is null
            ? null
            : latestAttempt.TotalQuestions > 0
                ? latestAttempt.ScorePercent
                : latestAttempt.IsCorrect
                    ? 100d
                    : 0d;

        int? latestTotalQuestions = latestAttempt is null
            ? null
            : latestAttempt.TotalQuestions > 0
                ? latestAttempt.TotalQuestions
                : 1;

        int? latestCorrectAnswers = latestAttempt is null
            ? null
            : latestAttempt.TotalQuestions > 0
                ? latestAttempt.CorrectAnswers
                : latestAttempt.IsCorrect
                    ? 1
                    : 0;

        return AdminCrudResult<LessonExerciseStatusDto>.Success(new LessonExerciseStatusDto
        {
            LessonId = lesson.Id,
            Passed = passed,
            AttemptCount = attemptCount,
            BestScorePercent = bestScore,
            LastScorePercent = latestScore,
            LastCorrectAnswers = latestCorrectAnswers,
            LastTotalQuestions = latestTotalQuestions,
            LastPassed = latestAttempt is null ? null : latestAttempt.Passed || latestAttempt.IsCorrect,
            LastTimedOut = latestAttempt?.TimedOut,
            LastTabViolation = latestAttempt?.TabViolation,
            LastTabSwitchCount = latestAttempt?.TabSwitchCount,
            PassingPercent = LessonExerciseHelper.NormalizePassingPercent(lesson.ExercisePassingPercent),
            TimeLimitSeconds = LessonExerciseHelper.NormalizeTimeLimitSeconds(lesson.ExerciseTimeLimitSeconds),
            MaxTabSwitches = LessonExerciseHelper.NormalizeMaxTabSwitches(lesson.ExerciseMaxTabSwitches),
            LastAttemptedAt = latestAttempt?.AttemptedAt
        });
    }
}
