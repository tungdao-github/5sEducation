using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public partial class CourseCatalogService
{
    private async Task<CourseCatalogResult> GetAllCoreAsync(CourseCatalogQuery query, CancellationToken cancellationToken)
    {
        var page = await _courses.GetAllAsync(query, cancellationToken);
        var now = DateTime.UtcNow;
        var items = page.Items.Select(course => MapCourseList(course, now)).ToList();

        return new CourseCatalogResult
        {
            Items = items,
            TotalCount = page.TotalCount
        };
    }

    private async Task<List<CourseCompareDto>> CompareCoreAsync(string? ids, CancellationToken cancellationToken)
    {
        var idList = CourseCatalogCompareHelper.ParseIds(ids);

        if (idList.Count == 0)
        {
            return [];
        }

        var rawCourses = await _courses.CompareAsync(idList, cancellationToken);
        var now = DateTime.UtcNow;

        return rawCourses
            .Select(course => CourseCatalogCompareHelper.Map(course, now))
            .OrderBy(course => idList.IndexOf(course.Id))
            .ToList();
    }

    private async Task<List<CourseListDto>?> GetRelatedCoreAsync(string slug, int? take, CancellationToken cancellationToken)
    {
        var course = await _courses.GetPublishedBySlugAsync(slug, cancellationToken);
        if (course is null)
        {
            return null;
        }

        var limit = Math.Clamp(take ?? 6, 1, 12);
        var relatedCourses = await _courses.GetRelatedAsync(course.Id, course.CategoryId, course.Level, limit, cancellationToken);
        var now = DateTime.UtcNow;
        return relatedCourses.Select(courseSummary => MapCourseList(courseSummary, now)).ToList();
    }

    private async Task<CourseDetailDto?> GetBySlugCoreAsync(string slug, string? userId, bool isAdmin, CancellationToken cancellationToken)
    {
        var course = await _courses.GetDetailBySlugAsync(slug, cancellationToken);
        if (course is null)
        {
            return null;
        }

        var isInstructor = !string.IsNullOrWhiteSpace(userId) && course.InstructorId == userId;
        if (!course.IsPublished && !isAdmin && !isInstructor)
        {
            return null;
        }

        var isEnrolled = false;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            isEnrolled = await _courses.IsUserEnrolledAsync(userId, course.Id, cancellationToken);
        }

        var canAccessContent = isAdmin || isInstructor || isEnrolled;
        var now = DateTime.UtcNow;
        return MapCourseDetail(
            course,
            now,
            course.Reviews.Count > 0 ? course.Reviews.Average(r => r.Rating) : 0,
            course.Reviews.Count,
            course.Enrollments.Count,
            course.Lessons.Count,
            (int)Math.Round(course.Lessons.Sum(l => l.DurationMinutes)),
            course.Instructor == null ? string.Empty : (course.Instructor.FirstName + " " + course.Instructor.LastName).Trim(),
            course.Instructor?.AvatarUrl,
            course.Lessons.OrderBy(l => l.SortOrder).Select(lesson => MapLesson(lesson, canAccessContent)).ToList());
    }

    private async Task<CourseDetailDto?> GetByIdCoreAsync(int id, string? userId, bool isAdmin, CancellationToken cancellationToken)
    {
        var course = await _courses.FindByIdAsync(id, cancellationToken);
        if (course is null)
        {
            return null;
        }

        return await GetBySlugCoreAsync(course.Slug, userId, isAdmin, cancellationToken);
    }
}
