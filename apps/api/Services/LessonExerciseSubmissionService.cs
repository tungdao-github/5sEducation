using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class LessonExerciseSubmissionService
{
    private readonly ILessonsRepository _repository;

    public LessonExerciseSubmissionService(ILessonsRepository repository)
    {
        _repository = repository;
    }

    public async Task<AdminCrudResult<LessonExerciseResultDto>> SubmitExerciseAsync(
        string userId,
        int lessonId,
        LessonExerciseSubmissionRequest request,
        CancellationToken cancellationToken = default)
    {
        var lesson = await _repository.FindWithDetailsAsync(lessonId, cancellationToken);
        if (lesson is null)
        {
            return AdminCrudResult<LessonExerciseResultDto>.NotFound();
        }

        if (!LessonExerciseHelper.IsExerciseConfigured(lesson))
        {
            return AdminCrudResult<LessonExerciseResultDto>.BadRequest("This lesson does not have an exercise.");
        }

        var enrollment = await _repository.FindEnrollmentAsync(userId, lesson.CourseId, includeProgresses: true, cancellationToken: cancellationToken);
        if (enrollment is null)
        {
            return AdminCrudResult<LessonExerciseResultDto>.Forbidden();
        }

        var questions = LessonExerciseHelper.GetConfiguredQuestions(lesson);
        if (questions.Count == 0)
        {
            return AdminCrudResult<LessonExerciseResultDto>.BadRequest("This lesson does not have an exercise.");
        }

        var submittedAt = DateTime.UtcNow;
        var plan = LessonExerciseSubmissionHelper.BuildPlan(
            request,
            questions,
            lesson.ExercisePassingPercent,
            lesson.ExerciseTimeLimitSeconds,
            lesson.ExerciseMaxTabSwitches,
            submittedAt);
        var answersJson = LessonExerciseSubmissionHelper.SerializeAttemptAnswers(plan.QuestionResults);

        await using var transaction = await _repository.BeginTransactionAsync(cancellationToken);

        await _repository.AddAttemptAsync(new LessonExerciseAttempt
        {
            EnrollmentId = enrollment.Id,
            LessonId = lesson.Id,
            SelectedOption = plan.LegacySelectedOption,
            IsCorrect = plan.Passed,
            ScorePercent = plan.ScorePercent,
            CorrectAnswers = plan.CorrectAnswers,
            TotalQuestions = plan.TotalQuestions,
            Passed = plan.Passed,
            TimeSpentSeconds = plan.TimeSpentSeconds,
            AllowedTimeSeconds = plan.AllowedTimeSeconds,
            TimedOut = plan.TimedOut,
            TabSwitchCount = plan.TabSwitchCount,
            AllowedTabSwitches = plan.AllowedTabSwitches,
            TabViolation = plan.TabViolation,
            StartedAt = plan.StartedAt,
            AnswersJson = answersJson,
            AttemptedAt = plan.SubmittedAt
        }, cancellationToken);

        if (plan.Passed)
        {
            var progress = enrollment.LessonProgresses.FirstOrDefault(lp => lp.LessonId == lesson.Id);
            if (progress is null)
            {
                enrollment.LessonProgresses.Add(new LessonProgress
                {
                    EnrollmentId = enrollment.Id,
                    LessonId = lesson.Id,
                    CompletedAt = plan.SubmittedAt,
                    UpdatedAt = plan.SubmittedAt
                });
            }
            else
            {
                progress.CompletedAt = plan.SubmittedAt;
                progress.UpdatedAt = plan.SubmittedAt;
            }

            enrollment.LastLessonId = lesson.Id;
            enrollment.UpdatedAt = plan.SubmittedAt;
        }

        await _repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var attemptCount = await _repository.CountAttemptsAsync(enrollment.Id, lesson.Id, cancellationToken);
        var passedAny = await _repository.HasPassedAttemptAsync(enrollment.Id, lesson.Id, cancellationToken);

        return AdminCrudResult<LessonExerciseResultDto>.Success(new LessonExerciseResultDto
        {
            IsCorrect = plan.Passed,
            Passed = passedAny,
            AttemptCount = attemptCount,
            ScorePercent = plan.ScorePercent,
            PassingPercent = plan.PassingPercent,
            CorrectAnswers = plan.CorrectAnswers,
            TotalQuestions = plan.TotalQuestions,
            TimeSpentSeconds = plan.TimeSpentSeconds,
            AllowedTimeSeconds = plan.AllowedTimeSeconds,
            TimedOut = plan.TimedOut,
            TabSwitchCount = plan.TabSwitchCount,
            AllowedTabSwitches = plan.AllowedTabSwitches,
            TabViolation = plan.TabViolation,
            MessageCode = plan.MessageCode,
            Message = LessonExerciseHelper.GetMessageForCode(plan.MessageCode),
            QuestionResults = plan.QuestionResults
        });
    }
}
