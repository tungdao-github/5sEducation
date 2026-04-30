using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public static class CourseCatalogCompareHelper
{
    public static List<int> ParseIds(string? ids)
    {
        if (string.IsNullOrWhiteSpace(ids))
        {
            return [];
        }

        return ids
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(value => int.TryParse(value, out var id) ? id : 0)
            .Where(id => id > 0)
            .Distinct()
            .Take(4)
            .ToList();
    }

    public static CourseCompareDto Map(CourseSummaryProjection course, DateTime now)
    {
        var mapped = CourseCatalogMappingHelper.MapCourseList(course, now);

        return new CourseCompareDto
        {
            Id = course.Id,
            Title = course.Title,
            Slug = course.Slug,
            ShortDescription = course.ShortDescription,
            Description = course.Description,
            Outcome = course.Outcome,
            Requirements = course.Requirements,
            Price = course.Price,
            EffectivePrice = mapped.EffectivePrice,
            OriginalPrice = mapped.OriginalPrice,
            IsFlashSaleActive = mapped.IsFlashSaleActive,
            FlashSalePrice = course.FlashSalePrice,
            FlashSaleStartsAt = course.FlashSaleStartsAt,
            FlashSaleEndsAt = course.FlashSaleEndsAt,
            ThumbnailUrl = course.ThumbnailUrl,
            Language = course.Language,
            Level = course.Level,
            AverageRating = course.AverageRating,
            ReviewCount = course.ReviewCount,
            StudentCount = course.StudentCount,
            InstructorName = course.InstructorName,
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
}
