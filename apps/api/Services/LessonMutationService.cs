using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class LessonMutationService
{
    private readonly ILessonsRepository _repository;

    public LessonMutationService(ILessonsRepository repository)
    {
        _repository = repository;
    }

    public async Task<AdminCrudResult<object?>> CreateAsync(string? userId, bool isAdmin, LessonCreateRequest request, CancellationToken cancellationToken = default)
    {
        var course = await _repository.FindCourseAsync(request.CourseId, cancellationToken);
        if (course is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (!isAdmin && course.InstructorId != userId)
        {
            return AdminCrudResult<object?>.Forbidden();
        }

        if (!LessonExerciseHelper.TryNormalizeContentType(request.ContentType, out var contentType, out var contentTypeError))
        {
            return AdminCrudResult<object?>.BadRequest(contentTypeError);
        }

        if (contentType == "video" && string.IsNullOrWhiteSpace(request.VideoUrl))
        {
            return AdminCrudResult<object?>.BadRequest("Video URL is required for video lessons.");
        }

        if (contentType == "video"
            && LessonExerciseHelper.HasAnyExerciseInput(
                request.ExerciseQuestion,
                request.ExerciseOptionA,
                request.ExerciseOptionB,
                request.ExerciseOptionC,
                request.ExerciseOptionD,
                request.ExerciseCorrectOption,
                request.ExerciseExplanation,
                request.ExerciseQuestions))
        {
            return AdminCrudResult<object?>.BadRequest("Video lessons cannot contain exercise fields.");
        }

        if (!LessonExerciseHelper.TryBuildExerciseConfiguration(
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
                contentType == "exercise",
                out var exerciseConfiguration,
                out var error))
        {
            return AdminCrudResult<object?>.BadRequest(error);
        }

        var lesson = new Lesson
        {
            CourseId = request.CourseId,
            Title = request.Title.Trim(),
            ContentType = contentType,
            DurationMinutes = request.DurationMinutes,
            VideoUrl = contentType == "video" ? request.VideoUrl.Trim() : string.Empty,
            SortOrder = request.SortOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        LessonExerciseHelper.ApplyExerciseConfiguration(lesson, exerciseConfiguration);
        await _repository.AddLessonAsync(lesson, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(string? userId, bool isAdmin, int id, LessonUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var lesson = await _repository.FindWithCourseAsync(id, cancellationToken);
        if (lesson is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (!isAdmin && lesson.Course?.InstructorId != userId)
        {
            return AdminCrudResult<object?>.Forbidden();
        }

        if (!LessonExerciseHelper.TryNormalizeContentType(request.ContentType, out var contentType, out var contentTypeError))
        {
            return AdminCrudResult<object?>.BadRequest(contentTypeError);
        }

        if (contentType == "video" && string.IsNullOrWhiteSpace(request.VideoUrl))
        {
            return AdminCrudResult<object?>.BadRequest("Video URL is required for video lessons.");
        }

        if (contentType == "video"
            && LessonExerciseHelper.HasAnyExerciseInput(
                request.ExerciseQuestion,
                request.ExerciseOptionA,
                request.ExerciseOptionB,
                request.ExerciseOptionC,
                request.ExerciseOptionD,
                request.ExerciseCorrectOption,
                request.ExerciseExplanation,
                request.ExerciseQuestions))
        {
            return AdminCrudResult<object?>.BadRequest("Video lessons cannot contain exercise fields.");
        }

        if (!LessonExerciseHelper.TryBuildExerciseConfiguration(
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
                contentType == "exercise",
                out var exerciseConfiguration,
                out var error))
        {
            return AdminCrudResult<object?>.BadRequest(error);
        }

        lesson.Title = request.Title.Trim();
        lesson.ContentType = contentType;
        lesson.DurationMinutes = request.DurationMinutes;
        lesson.VideoUrl = contentType == "video" ? request.VideoUrl.Trim() : string.Empty;
        lesson.SortOrder = request.SortOrder;
        lesson.UpdatedAt = DateTime.UtcNow;

        LessonExerciseHelper.ApplyExerciseConfiguration(lesson, exerciseConfiguration);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(string? userId, bool isAdmin, int id, CancellationToken cancellationToken = default)
    {
        var lesson = await _repository.FindWithCourseAsync(id, cancellationToken);
        if (lesson is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (!isAdmin && lesson.Course?.InstructorId != userId)
        {
            return AdminCrudResult<object?>.Forbidden();
        }

        await _repository.RemoveLessonAsync(new Lesson { Id = lesson.Id }, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
