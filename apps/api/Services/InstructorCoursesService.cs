using UdemyClone.Api.Dtos;
using UdemyClone.Api.Common;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public enum InstructorCourseAccessStatus
{
    Success = 0,
    NotFound = 1,
    Forbidden = 2
}

public sealed class InstructorCourseAccessResult<T>
{
    public InstructorCourseAccessStatus Status { get; init; }
    public T? Value { get; init; }

    public static InstructorCourseAccessResult<T> Success(T value)
    {
        return new InstructorCourseAccessResult<T> { Status = InstructorCourseAccessStatus.Success, Value = value };
    }

    public static InstructorCourseAccessResult<T> NotFound()
    {
        return new InstructorCourseAccessResult<T> { Status = InstructorCourseAccessStatus.NotFound };
    }

    public static InstructorCourseAccessResult<T> Forbidden()
    {
        return new InstructorCourseAccessResult<T> { Status = InstructorCourseAccessStatus.Forbidden };
    }
}

public class InstructorCoursesService
{
    private readonly IInstructorCoursesRepository _repository;

    public InstructorCoursesService(IInstructorCoursesRepository repository)
    {
        _repository = repository;
    }

    public Task<List<CourseManageDto>> GetMineAsync(string userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        return _repository.GetMineAsync(userId, isAdmin, cancellationToken);
    }

    public async Task<InstructorCourseAccessResult<CourseDetailDto>> GetByIdAsync(
        int id,
        string userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var course = await _repository.GetDetailAsync(id, cancellationToken);
        if (course is null)
        {
            return InstructorCourseAccessResult<CourseDetailDto>.NotFound();
        }

        if (!isAdmin && course.InstructorId != userId)
        {
            return InstructorCourseAccessResult<CourseDetailDto>.Forbidden();
        }

        var now = DateTime.UtcNow;
        var dto = new CourseDetailDto
        {
            Id = course.Id,
            Title = course.Title,
            Slug = course.Slug,
            ShortDescription = course.ShortDescription,
            Price = course.Price,
            EffectivePrice = CoursePriceHelper.GetEffectivePrice(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now),
            OriginalPrice = CoursePriceHelper.GetOriginalPrice(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now),
            IsFlashSaleActive = CoursePriceHelper.IsFlashSaleActive(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now),
            FlashSalePrice = course.FlashSalePrice,
            FlashSaleStartsAt = course.FlashSaleStartsAt,
            FlashSaleEndsAt = course.FlashSaleEndsAt,
            ThumbnailUrl = course.ThumbnailUrl,
            Language = course.Language,
            Level = course.Level,
            AverageRating = course.Reviews.Count > 0 ? course.Reviews.Average(r => r.Rating) : 0,
            ReviewCount = course.Reviews.Count,
            StudentCount = course.Enrollments.Count,
            Description = course.Description,
            Outcome = course.Outcome,
            Requirements = course.Requirements,
            PreviewVideoUrl = course.PreviewVideoUrl,
            IsPublished = course.IsPublished,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,
            Category = course.Category == null
                ? null
                : new CategoryDto
                {
                    Id = course.Category.Id,
                    Title = course.Category.Title,
                    Slug = course.Category.Slug
                },
            Lessons = course.Lessons
                .OrderBy(l => l.SortOrder)
                .Select(LessonExerciseHelper.MapLesson)
                .ToList()
        };

        return InstructorCourseAccessResult<CourseDetailDto>.Success(dto);
    }

}
