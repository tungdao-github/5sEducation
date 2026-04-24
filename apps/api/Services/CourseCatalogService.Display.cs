using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public partial class CourseCatalogService
{
    private static CourseListDto MapCourseList(CourseSummaryProjection course, DateTime now)
    {
        return CourseCatalogMappingHelper.MapCourseList(course, now);
    }

    private static CourseDetailDto MapCourseDetail(
        Course course,
        DateTime now,
        double averageRating,
        int reviewCount,
        int studentCount,
        int totalLessons,
        int totalDurationMinutes,
        string instructorName,
        string? instructorAvatarUrl,
        List<LessonDto> lessons)
    {
        return CourseCatalogMappingHelper.MapCourseDetail(
            course,
            now,
            averageRating,
            reviewCount,
            studentCount,
            totalLessons,
            totalDurationMinutes,
            instructorName,
            instructorAvatarUrl,
            lessons);
    }

    private static LessonDto MapLesson(Lesson lesson, bool canAccessContent)
    {
        return CourseCatalogMappingHelper.MapLesson(lesson, canAccessContent);
    }
}
