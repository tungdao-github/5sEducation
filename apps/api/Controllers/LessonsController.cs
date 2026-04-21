using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/lessons")]
public class LessonsController : ControllerBase
{
    private const string VideoContentType = "video";
    private const string ExerciseContentType = "exercise";

    private readonly ApplicationDbContext _db;

    public LessonsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<LessonDto>>> GetByCourse([FromQuery] int courseId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var course = await _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null)
        {
            return NotFound();
        }

        var isAdmin = User.IsInRole("Admin");
        var isInstructor = course.InstructorId == userId;
        if (!isAdmin && !isInstructor)
        {
            var isEnrolled = await _db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId);
            if (!isEnrolled)
            {
                return Forbid();
            }
        }

        var lessons = await _db.Lessons
            .AsNoTracking()
            .AsSplitQuery()
            .Include(l => l.ExerciseQuestions)
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.SortOrder)
            .ToListAsync();

        return Ok(lessons.Select(MapLesson).ToList());
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpPost]
    public async Task<IActionResult> Create(LessonCreateRequest request)
    {
        var course = await _db.Courses.FindAsync(request.CourseId);
        if (course is null)
        {
            return NotFound();
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && course.InstructorId != userId)
        {
            return Forbid();
        }

        if (!TryNormalizeContentType(request.ContentType, out var contentType, out var contentTypeError))
        {
            return BadRequest(contentTypeError);
        }

        if (contentType == VideoContentType && string.IsNullOrWhiteSpace(request.VideoUrl))
        {
            return BadRequest("Video URL is required for video lessons.");
        }

        if (contentType == VideoContentType
            && HasAnyExerciseInput(
                request.ExerciseQuestion,
                request.ExerciseOptionA,
                request.ExerciseOptionB,
                request.ExerciseOptionC,
                request.ExerciseOptionD,
                request.ExerciseCorrectOption,
                request.ExerciseExplanation,
                request.ExerciseQuestions))
        {
            return BadRequest("Video lessons cannot contain exercise fields.");
        }

        if (!TryBuildExerciseConfiguration(
                request.ExerciseQuestion,
                request.ExerciseOptionA,
                request.ExerciseOptionB,
                request.ExerciseOptionC,
                request.ExerciseOptionD,
                request.ExerciseCorrectOption,
                request.ExerciseExplanation,
                request.ExerciseQuestions,
                request.ExercisePassingPercent,
                request.ExerciseTimeLimitMinutes,
                request.ExerciseMaxTabSwitches,
                contentType == ExerciseContentType,
                out var exerciseConfiguration,
                out var error))
        {
            return BadRequest(error);
        }

        var lesson = new Lesson
        {
            CourseId = request.CourseId,
            Title = request.Title.Trim(),
            ContentType = contentType,
            DurationMinutes = request.DurationMinutes,
            VideoUrl = contentType == VideoContentType ? request.VideoUrl.Trim() : string.Empty,
            SortOrder = request.SortOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        ApplyExerciseConfiguration(lesson, exerciseConfiguration);

        _db.Lessons.Add(lesson);
        await _db.SaveChangesAsync();
        return Ok();
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, LessonUpdateRequest request)
    {
        var lesson = await _db.Lessons
            .AsSplitQuery()
            .Include(l => l.Course)
            .Include(l => l.ExerciseQuestions)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (lesson is null)
        {
            return NotFound();
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && lesson.Course?.InstructorId != userId)
        {
            return Forbid();
        }

        if (!TryNormalizeContentType(request.ContentType, out var contentType, out var contentTypeError))
        {
            return BadRequest(contentTypeError);
        }

        if (contentType == VideoContentType && string.IsNullOrWhiteSpace(request.VideoUrl))
        {
            return BadRequest("Video URL is required for video lessons.");
        }

        if (contentType == VideoContentType
            && HasAnyExerciseInput(
                request.ExerciseQuestion,
                request.ExerciseOptionA,
                request.ExerciseOptionB,
                request.ExerciseOptionC,
                request.ExerciseOptionD,
                request.ExerciseCorrectOption,
                request.ExerciseExplanation,
                request.ExerciseQuestions))
        {
            return BadRequest("Video lessons cannot contain exercise fields.");
        }

        if (!TryBuildExerciseConfiguration(
                request.ExerciseQuestion,
                request.ExerciseOptionA,
                request.ExerciseOptionB,
                request.ExerciseOptionC,
                request.ExerciseOptionD,
                request.ExerciseCorrectOption,
                request.ExerciseExplanation,
                request.ExerciseQuestions,
                request.ExercisePassingPercent,
                request.ExerciseTimeLimitMinutes,
                request.ExerciseMaxTabSwitches,
                contentType == ExerciseContentType,
                out var exerciseConfiguration,
                out var error))
        {
            return BadRequest(error);
        }

        lesson.Title = request.Title.Trim();
        lesson.ContentType = contentType;
        lesson.DurationMinutes = request.DurationMinutes;
        lesson.VideoUrl = contentType == VideoContentType ? request.VideoUrl.Trim() : string.Empty;
        lesson.SortOrder = request.SortOrder;
        lesson.UpdatedAt = DateTime.UtcNow;

        ApplyExerciseConfiguration(lesson, exerciseConfiguration);

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var lesson = await _db.Lessons
            .AsNoTracking()
            .Select(l => new
            {
                l.Id,
                l.CourseId,
                InstructorId = l.Course != null ? l.Course.InstructorId : string.Empty
            })
            .FirstOrDefaultAsync(l => l.Id == id);
        if (lesson is null)
        {
            return NotFound();
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && lesson.InstructorId != userId)
        {
            return Forbid();
        }

        _db.Lessons.Remove(new Lesson { Id = lesson.Id });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet("{id:int}/exercise/status")]
    public async Task<ActionResult<LessonExerciseStatusDto>> GetExerciseStatus(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var lesson = await _db.Lessons
            .AsNoTracking()
            .AsSplitQuery()
            .Include(l => l.ExerciseQuestions)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (lesson is null)
        {
            return NotFound();
        }

        if (!IsExerciseConfigured(lesson))
        {
            return BadRequest("This lesson does not have an exercise.");
        }

        var enrollment = await _db.Enrollments
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == lesson.CourseId);
        if (enrollment is null)
        {
            return Forbid();
        }

        var attemptsQuery = _db.LessonExerciseAttempts
            .AsNoTracking()
            .Where(a => a.EnrollmentId == enrollment.Id && a.LessonId == lesson.Id);

        var attemptCount = await attemptsQuery.CountAsync();
        var passed = await attemptsQuery.AnyAsync(a => a.Passed || a.IsCorrect);
        var latestAttempt = await attemptsQuery
            .OrderByDescending(a => a.AttemptedAt)
            .FirstOrDefaultAsync();
        var bestScore = await attemptsQuery
            .Select(a => a.TotalQuestions > 0 ? a.ScorePercent : (a.IsCorrect ? 100d : 0d))
            .DefaultIfEmpty(0d)
            .MaxAsync();

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

        return Ok(new LessonExerciseStatusDto
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
            PassingPercent = NormalizePassingPercent(lesson.ExercisePassingPercent),
            TimeLimitSeconds = NormalizeTimeLimitSeconds(lesson.ExerciseTimeLimitSeconds),
            MaxTabSwitches = NormalizeMaxTabSwitches(lesson.ExerciseMaxTabSwitches),
            LastAttemptedAt = latestAttempt?.AttemptedAt
        });
    }

    [Authorize]
    [HttpPost("{id:int}/exercise/submit")]
    public async Task<ActionResult<LessonExerciseResultDto>> SubmitExercise(
        int id,
        [FromBody] LessonExerciseSubmissionRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var lesson = await _db.Lessons
            .AsNoTracking()
            .AsSplitQuery()
            .Include(l => l.ExerciseQuestions)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (lesson is null)
        {
            return NotFound();
        }

        if (!IsExerciseConfigured(lesson))
        {
            return BadRequest("This lesson does not have an exercise.");
        }

        var enrollment = await _db.Enrollments
            .Include(e => e.LessonProgresses)
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == lesson.CourseId);
        if (enrollment is null)
        {
            return Forbid();
        }

        var questions = GetConfiguredQuestions(lesson);
        if (questions.Count == 0)
        {
            return BadRequest("This lesson does not have an exercise.");
        }

        var answerLookup = request.Answers
            .Where(a => a.QuestionId != 0 && a.SelectedOption is >= 1 and <= 4)
            .GroupBy(a => a.QuestionId)
            .ToDictionary(g => g.Key, g => g.Last().SelectedOption);

        if (answerLookup.Count == 0 && request.SelectedOption is >= 1 and <= 4)
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

        var passingPercent = NormalizePassingPercent(lesson.ExercisePassingPercent);
        var allowedTimeSeconds = NormalizeTimeLimitSeconds(lesson.ExerciseTimeLimitSeconds);
        var allowedTabSwitches = NormalizeMaxTabSwitches(lesson.ExerciseMaxTabSwitches);
        var tabSwitchCount = Math.Max(0, request.TabSwitchCount);

        var submittedAt = DateTime.UtcNow;
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
        var passed = scorePercent >= passingPercent && !timedOut && !tabViolation;

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

        var answersJson = JsonSerializer.Serialize(questionResults.Select(r => new
        {
            r.QuestionId,
            r.SelectedOption,
            r.CorrectOption,
            r.IsCorrect
        }));

        _db.LessonExerciseAttempts.Add(new LessonExerciseAttempt
        {
            EnrollmentId = enrollment.Id,
            LessonId = lesson.Id,
            SelectedOption = legacySelectedOption,
            IsCorrect = passed,
            ScorePercent = scorePercent,
            CorrectAnswers = correctAnswers,
            TotalQuestions = totalQuestions,
            Passed = passed,
            TimeSpentSeconds = timeSpentSeconds,
            AllowedTimeSeconds = allowedTimeSeconds,
            TimedOut = timedOut,
            TabSwitchCount = tabSwitchCount,
            AllowedTabSwitches = allowedTabSwitches,
            TabViolation = tabViolation,
            StartedAt = startedAt,
            AnswersJson = answersJson,
            AttemptedAt = submittedAt
        });

        if (passed)
        {
            var progress = enrollment.LessonProgresses.FirstOrDefault(lp => lp.LessonId == lesson.Id);
            if (progress is null)
            {
                enrollment.LessonProgresses.Add(new LessonProgress
                {
                    EnrollmentId = enrollment.Id,
                    LessonId = lesson.Id,
                    CompletedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            else
            {
                progress.CompletedAt = DateTime.UtcNow;
                progress.UpdatedAt = DateTime.UtcNow;
            }

            enrollment.LastLessonId = lesson.Id;
            enrollment.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        var attemptCount = await _db.LessonExerciseAttempts
            .CountAsync(a => a.EnrollmentId == enrollment.Id && a.LessonId == lesson.Id);
        var passedAny = await _db.LessonExerciseAttempts
            .AnyAsync(a => a.EnrollmentId == enrollment.Id && a.LessonId == lesson.Id && (a.Passed || a.IsCorrect));

        return Ok(new LessonExerciseResultDto
        {
            IsCorrect = passed,
            Passed = passedAny,
            AttemptCount = attemptCount,
            ScorePercent = scorePercent,
            PassingPercent = passingPercent,
            CorrectAnswers = correctAnswers,
            TotalQuestions = totalQuestions,
            TimeSpentSeconds = timeSpentSeconds,
            AllowedTimeSeconds = allowedTimeSeconds,
            TimedOut = timedOut,
            TabSwitchCount = tabSwitchCount,
            AllowedTabSwitches = allowedTabSwitches,
            TabViolation = tabViolation,
            MessageCode = messageCode,
            Message = GetMessageForCode(messageCode),
            QuestionResults = questionResults
        });
    }

    private static LessonDto MapLesson(Lesson lesson)
    {
        var questions = GetConfiguredQuestions(lesson);
        var hasStructuredExercise = questions.Count > 0;
        var normalizedType = NormalizeContentTypeForResponse(lesson.ContentType, hasStructuredExercise);
        var hasExercise = normalizedType == ExerciseContentType && hasStructuredExercise;

        return new LessonDto
        {
            Id = lesson.Id,
            CourseId = lesson.CourseId,
            Title = lesson.Title,
            ContentType = normalizedType,
            DurationMinutes = lesson.DurationMinutes,
            VideoUrl = lesson.VideoUrl,
            SortOrder = lesson.SortOrder,
            HasExercise = hasExercise,
            Exercise = hasExercise
                ? new LessonExerciseDto
                {
                    PassingPercent = NormalizePassingPercent(lesson.ExercisePassingPercent),
                    TimeLimitSeconds = NormalizeTimeLimitSeconds(lesson.ExerciseTimeLimitSeconds),
                    MaxTabSwitches = NormalizeMaxTabSwitches(lesson.ExerciseMaxTabSwitches),
                    Questions = questions
                        .OrderBy(q => q.SortOrder)
                        .Select(q => new LessonExerciseQuestionDto
                        {
                            Id = q.Id,
                            Question = q.Question,
                            OptionA = q.OptionA,
                            OptionB = q.OptionB,
                            OptionC = q.OptionC,
                            OptionD = q.OptionD,
                            SortOrder = q.SortOrder
                        })
                        .ToList()
                }
                : null
        };
    }

    private static bool TryBuildExerciseConfiguration(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int? correctOption,
        string? explanationInput,
        List<LessonExerciseQuestionInputDto>? questionInputs,
        int passingPercentInput,
        int timeLimitMinutesInput,
        int maxTabSwitchesInput,
        bool required,
        out ExerciseConfiguration configuration,
        out string error)
    {
        var questions = new List<ExerciseQuestionData>();
        var structuredInputs = questionInputs ?? [];
        var hasLegacyInput = false;
        var legacyQuestion = ExerciseQuestionData.Empty;

        foreach (var (input, index) in structuredInputs.Select((value, index) => (value, index)))
        {
            if (!HasAnyQuestionInput(input))
            {
                continue;
            }

            if (!TryBuildQuestion(
                    input.Question,
                    input.OptionA,
                    input.OptionB,
                    input.OptionC,
                    input.OptionD,
                    input.CorrectOption,
                    input.Explanation,
                    input.SortOrder > 0 ? input.SortOrder : index + 1,
                    out var question,
                    out error))
            {
                configuration = ExerciseConfiguration.Empty;
                return false;
            }

            questions.Add(question);
        }

        if (questions.Count == 0
            && !TryBuildLegacyQuestion(
                questionInput,
                optionAInput,
                optionBInput,
                optionCInput,
                optionDInput,
                correctOption,
                explanationInput,
                out legacyQuestion,
                out hasLegacyInput,
                out error))
        {
            configuration = ExerciseConfiguration.Empty;
            return false;
        }
        else if (questions.Count == 0 && hasLegacyInput)
        {
            questions.Add(legacyQuestion);
        }

        if (required && questions.Count == 0)
        {
            configuration = ExerciseConfiguration.Empty;
            error = "Exercise lessons require at least one question with four answer options.";
            return false;
        }

        if (questions.Count == 0)
        {
            configuration = ExerciseConfiguration.Empty;
            error = string.Empty;
            return true;
        }

        var normalizedQuestions = questions
            .OrderBy(q => q.SortOrder)
            .Select((q, index) => q with { SortOrder = index + 1 })
            .ToList();

        configuration = new ExerciseConfiguration(
            normalizedQuestions,
            NormalizePassingPercent(passingPercentInput),
            NormalizeTimeLimitSeconds(timeLimitMinutesInput * 60),
            NormalizeMaxTabSwitches(maxTabSwitchesInput));

        error = string.Empty;
        return true;
    }

    private static bool TryBuildLegacyQuestion(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int? correctOption,
        string? explanationInput,
        out ExerciseQuestionData question,
        out bool hasLegacyInput,
        out string error)
    {
        hasLegacyInput = HasAnyLegacyExerciseInput(
            questionInput,
            optionAInput,
            optionBInput,
            optionCInput,
            optionDInput,
            correctOption,
            explanationInput);

        if (!hasLegacyInput)
        {
            question = ExerciseQuestionData.Empty;
            error = string.Empty;
            return true;
        }

        var numericCorrectOption = correctOption ?? 0;
        if (!TryBuildQuestion(
                questionInput,
                optionAInput,
                optionBInput,
                optionCInput,
                optionDInput,
                numericCorrectOption,
                explanationInput,
                1,
                out question,
                out error))
        {
            return false;
        }

        return true;
    }

    private static bool TryBuildQuestion(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int correctOption,
        string? explanationInput,
        int sortOrder,
        out ExerciseQuestionData question,
        out string error)
    {
        var normalizedQuestion = (questionInput ?? string.Empty).Trim();
        var optionA = (optionAInput ?? string.Empty).Trim();
        var optionB = (optionBInput ?? string.Empty).Trim();
        var optionC = (optionCInput ?? string.Empty).Trim();
        var optionD = (optionDInput ?? string.Empty).Trim();
        var explanation = (explanationInput ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(normalizedQuestion))
        {
            question = ExerciseQuestionData.Empty;
            error = "Exercise question is required.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(optionA)
            || string.IsNullOrWhiteSpace(optionB)
            || string.IsNullOrWhiteSpace(optionC)
            || string.IsNullOrWhiteSpace(optionD))
        {
            question = ExerciseQuestionData.Empty;
            error = "Please provide all four answer options for each exercise question.";
            return false;
        }

        if (correctOption is < 1 or > 4)
        {
            question = ExerciseQuestionData.Empty;
            error = "Exercise correct option must be between 1 and 4.";
            return false;
        }

        question = new ExerciseQuestionData(
            Id: 0,
            Question: normalizedQuestion,
            OptionA: optionA,
            OptionB: optionB,
            OptionC: optionC,
            OptionD: optionD,
            CorrectOption: correctOption,
            Explanation: explanation,
            SortOrder: sortOrder <= 0 ? 1 : sortOrder);
        error = string.Empty;
        return true;
    }

    private static void ApplyExerciseConfiguration(Lesson lesson, ExerciseConfiguration configuration)
    {
        lesson.ExerciseQuestions.Clear();

        if (!configuration.HasExercise)
        {
            lesson.ExerciseQuestion = string.Empty;
            lesson.ExerciseOptionA = string.Empty;
            lesson.ExerciseOptionB = string.Empty;
            lesson.ExerciseOptionC = string.Empty;
            lesson.ExerciseOptionD = string.Empty;
            lesson.ExerciseCorrectOption = null;
            lesson.ExerciseExplanation = string.Empty;
            lesson.ExercisePassingPercent = 80;
            lesson.ExerciseTimeLimitSeconds = 0;
            lesson.ExerciseMaxTabSwitches = 2;
            return;
        }

        var firstQuestion = configuration.Questions.First();
        lesson.ExerciseQuestion = firstQuestion.Question;
        lesson.ExerciseOptionA = firstQuestion.OptionA;
        lesson.ExerciseOptionB = firstQuestion.OptionB;
        lesson.ExerciseOptionC = firstQuestion.OptionC;
        lesson.ExerciseOptionD = firstQuestion.OptionD;
        lesson.ExerciseCorrectOption = firstQuestion.CorrectOption;
        lesson.ExerciseExplanation = firstQuestion.Explanation;
        lesson.ExercisePassingPercent = NormalizePassingPercent(configuration.PassingPercent);
        lesson.ExerciseTimeLimitSeconds = NormalizeTimeLimitSeconds(configuration.TimeLimitSeconds);
        lesson.ExerciseMaxTabSwitches = NormalizeMaxTabSwitches(configuration.MaxTabSwitches);

        foreach (var question in configuration.Questions.OrderBy(q => q.SortOrder))
        {
            lesson.ExerciseQuestions.Add(new LessonExerciseQuestion
            {
                Question = question.Question,
                OptionA = question.OptionA,
                OptionB = question.OptionB,
                OptionC = question.OptionC,
                OptionD = question.OptionD,
                CorrectOption = question.CorrectOption,
                Explanation = question.Explanation,
                SortOrder = question.SortOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }

    private static List<ExerciseQuestionData> GetConfiguredQuestions(Lesson lesson)
    {
        var structuredQuestions = lesson.ExerciseQuestions
            .Where(q =>
                !string.IsNullOrWhiteSpace(q.Question)
                && !string.IsNullOrWhiteSpace(q.OptionA)
                && !string.IsNullOrWhiteSpace(q.OptionB)
                && !string.IsNullOrWhiteSpace(q.OptionC)
                && !string.IsNullOrWhiteSpace(q.OptionD)
                && q.CorrectOption is >= 1 and <= 4)
            .OrderBy(q => q.SortOrder)
            .ThenBy(q => q.Id)
            .Select(q => new ExerciseQuestionData(
                q.Id,
                q.Question,
                q.OptionA,
                q.OptionB,
                q.OptionC,
                q.OptionD,
                q.CorrectOption,
                q.Explanation,
                q.SortOrder))
            .ToList();

        if (structuredQuestions.Count > 0)
        {
            return structuredQuestions;
        }

        var hasLegacyQuestion = !string.IsNullOrWhiteSpace(lesson.ExerciseQuestion)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionA)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionB)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionC)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionD)
            && lesson.ExerciseCorrectOption is >= 1 and <= 4;

        if (!hasLegacyQuestion)
        {
            return [];
        }

        return
        [
            new ExerciseQuestionData(
                Id: 1,
                Question: lesson.ExerciseQuestion,
                OptionA: lesson.ExerciseOptionA,
                OptionB: lesson.ExerciseOptionB,
                OptionC: lesson.ExerciseOptionC,
                OptionD: lesson.ExerciseOptionD,
                CorrectOption: lesson.ExerciseCorrectOption!.Value,
                Explanation: lesson.ExerciseExplanation,
                SortOrder: 1)
        ];
    }

    private static int NormalizePassingPercent(int passingPercent)
    {
        if (passingPercent < 1)
        {
            return 80;
        }

        return Math.Min(100, passingPercent);
    }

    private static int NormalizeTimeLimitSeconds(int timeLimitSeconds)
    {
        return Math.Clamp(timeLimitSeconds, 0, 7200);
    }

    private static int NormalizeMaxTabSwitches(int maxTabSwitches)
    {
        return Math.Clamp(maxTabSwitches, 0, 20);
    }

    private static bool HasAnyExerciseInput(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int? correctOption,
        string? explanationInput,
        List<LessonExerciseQuestionInputDto>? questionInputs)
    {
        return HasAnyLegacyExerciseInput(
                   questionInput,
                   optionAInput,
                   optionBInput,
                   optionCInput,
                   optionDInput,
                   correctOption,
                   explanationInput)
               || (questionInputs?.Any(HasAnyQuestionInput) ?? false);
    }

    private static bool HasAnyLegacyExerciseInput(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int? correctOption,
        string? explanationInput)
    {
        return !string.IsNullOrWhiteSpace(questionInput)
            || !string.IsNullOrWhiteSpace(optionAInput)
            || !string.IsNullOrWhiteSpace(optionBInput)
            || !string.IsNullOrWhiteSpace(optionCInput)
            || !string.IsNullOrWhiteSpace(optionDInput)
            || !string.IsNullOrWhiteSpace(explanationInput)
            || correctOption.HasValue;
    }

    private static bool HasAnyQuestionInput(LessonExerciseQuestionInputDto? input)
    {
        if (input is null)
        {
            return false;
        }

        return !string.IsNullOrWhiteSpace(input.Question)
            || !string.IsNullOrWhiteSpace(input.OptionA)
            || !string.IsNullOrWhiteSpace(input.OptionB)
            || !string.IsNullOrWhiteSpace(input.OptionC)
            || !string.IsNullOrWhiteSpace(input.OptionD)
            || !string.IsNullOrWhiteSpace(input.Explanation)
            || input.CorrectOption != 0;
    }

    private static bool TryNormalizeContentType(string? contentTypeInput, out string contentType, out string error)
    {
        var normalized = (contentTypeInput ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalized))
        {
            contentType = VideoContentType;
            error = string.Empty;
            return true;
        }

        if (normalized is VideoContentType or ExerciseContentType)
        {
            contentType = normalized;
            error = string.Empty;
            return true;
        }

        contentType = string.Empty;
        error = "ContentType must be either 'video' or 'exercise'.";
        return false;
    }

    private static string NormalizeContentTypeForResponse(string? contentTypeInput, bool fallbackToExercise)
    {
        var normalized = (contentTypeInput ?? string.Empty).Trim().ToLowerInvariant();
        if (normalized == ExerciseContentType)
        {
            return ExerciseContentType;
        }

        if (fallbackToExercise)
        {
            return ExerciseContentType;
        }

        return VideoContentType;
    }

    private static bool IsExerciseContentType(string? contentTypeInput)
    {
        return NormalizeContentTypeForResponse(contentTypeInput, fallbackToExercise: false) == ExerciseContentType;
    }

    private static bool IsExerciseConfigured(Lesson lesson)
    {
        return IsExerciseContentType(lesson.ContentType)
            && GetConfiguredQuestions(lesson).Count > 0;
    }

    private static string GetMessageForCode(string messageCode)
    {
        return messageCode switch
        {
            "passed" => "Excellent work. You passed this exercise.",
            "timed_out" => "Time is up for this exercise. Please try again.",
            "tab_violation" => "Exercise locked because the tab was switched too many times.",
            _ => "Not passed yet. Review and try again."
        };
    }

    private readonly record struct ExerciseConfiguration(
        List<ExerciseQuestionData> Questions,
        int PassingPercent,
        int TimeLimitSeconds,
        int MaxTabSwitches)
    {
        public bool HasExercise => Questions.Count > 0;

        public static ExerciseConfiguration Empty => new([], 80, 0, 2);
    }

    private readonly record struct ExerciseQuestionData(
        int Id,
        string Question,
        string OptionA,
        string OptionB,
        string OptionC,
        string OptionD,
        int CorrectOption,
        string Explanation,
        int SortOrder)
    {
        public static ExerciseQuestionData Empty => new(
            0,
            string.Empty,
            string.Empty,
            string.Empty,
            string.Empty,
            string.Empty,
            0,
            string.Empty,
            0);
    }
}
