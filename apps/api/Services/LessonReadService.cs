using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class LessonReadService
{
    private readonly ILessonsRepository _repository;

    public LessonReadService(ILessonsRepository repository)
    {
        _repository = repository;
    }

    public async Task<AdminCrudResult<List<LessonDto>>> GetByCourseAsync(string userId, bool isAdmin, int courseId, CancellationToken cancellationToken = default)
    {
        var course = await _repository.FindCourseAsync(courseId, cancellationToken);
        if (course is null)
        {
            return AdminCrudResult<List<LessonDto>>.NotFound();
        }

        if (!isAdmin && course.InstructorId != userId)
        {
            var isEnrolled = await _repository.IsEnrolledAsync(userId, courseId, cancellationToken);
            if (!isEnrolled)
            {
                return AdminCrudResult<List<LessonDto>>.Forbidden();
            }
        }

        var lessons = await _repository.GetByCourseAsync(courseId, cancellationToken);
        return AdminCrudResult<List<LessonDto>>.Success(lessons.Select(LessonExerciseHelper.MapLesson).ToList());
    }
}
