using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;
using UdemyClone.Api.Common;

namespace UdemyClone.Api.Services;

public partial class CourseCatalogService
{
    private readonly ICourseCatalogRepository _courses;
    private readonly CourseThumbnailStorageService _thumbnailStorage;

    public CourseCatalogService(ICourseCatalogRepository courses, CourseThumbnailStorageService thumbnailStorage)
    {
        _courses = courses;
        _thumbnailStorage = thumbnailStorage;
    }

    public async Task<CourseCatalogResult> GetAllAsync(CourseCatalogQuery query, CancellationToken cancellationToken = default)
    {
        return await GetAllCoreAsync(query, cancellationToken);
    }

    public async Task<List<CourseCompareDto>> CompareAsync(string? ids, CancellationToken cancellationToken = default)
    {
        return await CompareCoreAsync(ids, cancellationToken);
    }

    public async Task<List<CourseListDto>?> GetRelatedAsync(string slug, int? take, CancellationToken cancellationToken = default)
    {
        return await GetRelatedCoreAsync(slug, take, cancellationToken);
    }

    public async Task<CourseDetailDto?> GetBySlugAsync(
        string slug,
        string? userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        return await GetBySlugCoreAsync(slug, userId, isAdmin, cancellationToken);
    }

    public async Task<CourseDetailDto?> GetByIdAsync(
        int id,
        string? userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        return await GetByIdCoreAsync(id, userId, isAdmin, cancellationToken);
    }

    public async Task<CourseMutationResult> CreateAsync(
        CourseCreateRequest request,
        string instructorId,
        CancellationToken cancellationToken = default)
    {
        return await CreateCoreAsync(request, instructorId, cancellationToken);
    }

    public async Task<CourseMutationResult> UpdateAsync(
        int id,
        CourseUpdateRequest request,
        string? userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        return await UpdateCoreAsync(id, request, userId, isAdmin, cancellationToken);
    }

    public async Task<CourseMutationResult> DeleteAsync(
        int id,
        string? userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        return await DeleteCoreAsync(id, userId, isAdmin, cancellationToken);
    }
}
