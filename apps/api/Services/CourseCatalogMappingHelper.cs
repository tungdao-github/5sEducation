using UdemyClone.Api.Common;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public static class CourseCatalogMappingHelper
{
    public static CourseListDto MapCourseList(CourseSummaryProjection course, DateTime now)
    {
        return new CourseListDto
        {
            Id = course.Id,
            Title = course.Title,
            Slug = course.Slug,
            ShortDescription = course.ShortDescription,
            Price = course.Price,
            EffectivePrice = CoursePriceHelper.GetEffectivePrice(course, now),
            OriginalPrice = CoursePriceHelper.GetOriginalPrice(course, now),
            IsFlashSaleActive = CoursePriceHelper.IsFlashSaleActive(course, now),
            FlashSalePrice = course.FlashSalePrice,
            FlashSaleStartsAt = course.FlashSaleStartsAt,
            FlashSaleEndsAt = course.FlashSaleEndsAt,
            ThumbnailUrl = course.ThumbnailUrl,
            Language = course.Language,
            Level = course.Level,
            AverageRating = course.AverageRating,
            ReviewCount = course.ReviewCount,
            StudentCount = course.StudentCount,
            InstructorName = string.IsNullOrWhiteSpace(course.InstructorName) ? null : course.InstructorName,
            InstructorAvatarUrl = course.InstructorAvatarUrl,
            TotalLessons = course.TotalLessons,
            TotalDurationMinutes = course.TotalDurationMinutes,
            Category = !course.CategoryId.HasValue || course.CategoryId.Value <= 0 || string.IsNullOrWhiteSpace(course.CategoryTitle) || string.IsNullOrWhiteSpace(course.CategorySlug)
                ? null
                : new CategoryDto
                {
                    Id = course.CategoryId.Value,
                    Title = course.CategoryTitle!,
                    Slug = course.CategorySlug!
                }
        };
    }

    public static CourseDetailDto MapCourseDetail(
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
        return new CourseDetailDto
        {
            Id = course.Id,
            Title = course.Title,
            Slug = course.Slug,
            ShortDescription = course.ShortDescription,
            Price = course.Price,
            EffectivePrice = CoursePriceHelper.GetEffectivePrice(course, now),
            OriginalPrice = CoursePriceHelper.GetOriginalPrice(course, now),
            IsFlashSaleActive = CoursePriceHelper.IsFlashSaleActive(course, now),
            FlashSalePrice = course.FlashSalePrice,
            FlashSaleStartsAt = course.FlashSaleStartsAt,
            FlashSaleEndsAt = course.FlashSaleEndsAt,
            ThumbnailUrl = course.ThumbnailUrl,
            Language = course.Language,
            Level = course.Level,
            AverageRating = averageRating,
            ReviewCount = reviewCount,
            StudentCount = studentCount,
            InstructorName = instructorName,
            InstructorAvatarUrl = instructorAvatarUrl,
            TotalLessons = totalLessons,
            TotalDurationMinutes = totalDurationMinutes,
            Description = course.Description,
            Outcome = course.Outcome,
            Requirements = course.Requirements,
            PreviewVideoUrl = course.PreviewVideoUrl,
            IsPublished = course.IsPublished,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,
            Category = course.Category == null ? null : new CategoryDto
            {
                Id = course.Category.Id,
                Title = course.Category.Title,
                Slug = course.Category.Slug
            },
            Lessons = lessons
        };
    }

    public static LessonDto MapLesson(Lesson lesson, bool canAccessContent)
    {
        return CourseCatalogLessonMappingHelper.MapLesson(lesson, canAccessContent);
    }
}
