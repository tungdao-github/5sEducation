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

        if (!LessonMutationHelper.CanEditCourse(userId, isAdmin, course.InstructorId))
        {
            return AdminCrudResult<object?>.Forbidden();
        }

        if (!LessonMutationHelper.TryBuildDraft(request, out var draft, out var error))
        {
            return AdminCrudResult<object?>.BadRequest(error);
        }

        var lesson = new Lesson
        {
            CourseId = request.CourseId,
            Title = draft.Title,
            ContentType = draft.ContentType,
            DurationMinutes = draft.DurationMinutes,
            VideoUrl = draft.VideoUrl,
            SortOrder = draft.SortOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        LessonMutationHelper.ApplyDraft(lesson, draft);
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

        if (!LessonMutationHelper.CanEditCourse(userId, isAdmin, lesson.Course?.InstructorId))
        {
            return AdminCrudResult<object?>.Forbidden();
        }

        if (!LessonMutationHelper.TryBuildDraft(request, out var draft, out var error))
        {
            return AdminCrudResult<object?>.BadRequest(error);
        }

        LessonMutationHelper.ApplyDraft(lesson, draft);
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
