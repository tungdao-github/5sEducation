using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static class LearningPathAdminHelper
{
    public static LearningPathListDto MapList(LearningPath path)
    {
        return new LearningPathListDto
        {
            Id = path.Id,
            Title = path.Title,
            Slug = path.Slug,
            Description = path.Description,
            Level = path.Level,
            ThumbnailUrl = path.ThumbnailUrl,
            EstimatedHours = path.EstimatedHours,
            CourseCount = path.Courses.Count,
            IsPublished = path.IsPublished
        };
    }

    public static LearningPathDetailDto MapDetail(
        LearningPath path,
        List<LearningPathSectionDto> sections,
        List<LearningPathCourseDto> courses)
    {
        return new LearningPathDetailDto
        {
            Id = path.Id,
            Title = path.Title,
            Slug = path.Slug,
            Description = path.Description,
            Level = path.Level,
            ThumbnailUrl = path.ThumbnailUrl,
            EstimatedHours = path.EstimatedHours,
            IsPublished = path.IsPublished,
            CourseCount = courses.Count,
            Sections = sections,
            Courses = courses
        };
    }

    public static LearningPathSectionDto MapSection(LearningPathSection section)
    {
        return new LearningPathSectionDto
        {
            Id = section.Id,
            LearningPathId = section.LearningPathId,
            Title = section.Title,
            Description = section.Description,
            SortOrder = section.SortOrder
        };
    }

    public static LearningPathCourseDto MapCourse(LearningPathCourse course, Models.Course? sourceCourse)
    {
        return new LearningPathCourseDto
        {
            Id = course.Id,
            LearningPathId = course.LearningPathId,
            LearningPathSectionId = course.LearningPathSectionId,
            CourseId = course.CourseId,
            CourseTitle = sourceCourse?.Title ?? string.Empty,
            CourseSlug = sourceCourse?.Slug ?? string.Empty,
            CourseThumbnailUrl = sourceCourse?.ThumbnailUrl ?? string.Empty,
            CourseLevel = sourceCourse?.Level ?? string.Empty,
            CourseLanguage = sourceCourse?.Language ?? string.Empty,
            SortOrder = course.SortOrder,
            IsRequired = course.IsRequired
        };
    }
}
