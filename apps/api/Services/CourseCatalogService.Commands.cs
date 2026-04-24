using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Common;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public partial class CourseCatalogService
{
    private async Task<CourseMutationResult> CreateCoreAsync(
        CourseCreateRequest request,
        string instructorId,
        CancellationToken cancellationToken)
    {
        var slug = SlugHelper.Slugify(request.Title);
        var (thumbnailUrl, thumbnailError) = await _thumbnailStorage.SaveAsync(request.Thumbnail, cancellationToken);
        if (!string.IsNullOrWhiteSpace(thumbnailError))
        {
            return CourseMutationResult.BadRequest(thumbnailError);
        }

        var normalizedThumbnailUrl = !string.IsNullOrWhiteSpace(thumbnailUrl)
            ? thumbnailUrl
            : (request.ThumbnailUrl ?? string.Empty).Trim();

        var flashSalePrice = CoursePriceHelper.NormalizeFlashSalePrice(request.Price, request.FlashSalePrice);
        var (flashStart, flashEnd) = CoursePriceHelper.NormalizeFlashSaleWindow(request.FlashSaleStartsAt, request.FlashSaleEndsAt);

        var course = new Course
        {
            Title = request.Title,
            Slug = slug,
            InstructorId = instructorId,
            CategoryId = request.CategoryId,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            Outcome = request.Outcome,
            Requirements = request.Requirements,
            Language = request.Language,
            Price = request.Price,
            FlashSalePrice = flashSalePrice,
            FlashSaleStartsAt = flashStart,
            FlashSaleEndsAt = flashEnd,
            Level = request.Level,
            PreviewVideoUrl = request.PreviewVideoUrl,
            ThumbnailUrl = normalizedThumbnailUrl,
            IsPublished = request.IsPublished,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _courses.AddAsync(course, cancellationToken);
        await _courses.SaveChangesAsync(cancellationToken);

        var now = DateTime.UtcNow;
        return CourseMutationResult.Success(MapCourseDetail(
            course,
            now,
            0,
            0,
            0,
            0,
            0,
            string.Empty,
            null,
            []));
    }

    private async Task<CourseMutationResult> UpdateCoreAsync(
        int id,
        CourseUpdateRequest request,
        string? userId,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        var course = await _courses.FindByIdAsync(id, cancellationToken);
        if (course is null)
        {
            return CourseMutationResult.NotFound();
        }

        if (!isAdmin && course.InstructorId != userId)
        {
            return CourseMutationResult.Forbidden();
        }

        var (thumbnailUrl, thumbnailError) = await _thumbnailStorage.SaveAsync(request.Thumbnail, cancellationToken);
        if (!string.IsNullOrWhiteSpace(thumbnailError))
        {
            return CourseMutationResult.BadRequest(thumbnailError);
        }

        course.Title = request.Title;
        course.Slug = SlugHelper.Slugify(request.Title);
        course.CategoryId = request.CategoryId;
        course.ShortDescription = request.ShortDescription;
        course.Description = request.Description;
        course.Outcome = request.Outcome;
        course.Requirements = request.Requirements;
        course.Language = request.Language;
        course.Price = request.Price;
        course.FlashSalePrice = CoursePriceHelper.NormalizeFlashSalePrice(request.Price, request.FlashSalePrice);
        var (flashStart, flashEnd) = CoursePriceHelper.NormalizeFlashSaleWindow(request.FlashSaleStartsAt, request.FlashSaleEndsAt);
        course.FlashSaleStartsAt = flashStart;
        course.FlashSaleEndsAt = flashEnd;
        course.Level = request.Level;
        course.PreviewVideoUrl = request.PreviewVideoUrl;
        course.IsPublished = request.IsPublished;
        course.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(thumbnailUrl))
        {
            course.ThumbnailUrl = thumbnailUrl;
        }
        else if (!string.IsNullOrWhiteSpace(request.ThumbnailUrl))
        {
            course.ThumbnailUrl = request.ThumbnailUrl.Trim();
        }

        await _courses.SaveChangesAsync(cancellationToken);
        return CourseMutationResult.Success();
    }

    private async Task<CourseMutationResult> DeleteCoreAsync(int id, string? userId, bool isAdmin, CancellationToken cancellationToken)
    {
        var course = await _courses.FindByIdAsync(id, cancellationToken);
        if (course is null)
        {
            return CourseMutationResult.NotFound();
        }

        if (!isAdmin && course.InstructorId != userId)
        {
            return CourseMutationResult.Forbidden();
        }

        _courses.Remove(course);
        await _courses.SaveChangesAsync(cancellationToken);
        return CourseMutationResult.Success();
    }

}
