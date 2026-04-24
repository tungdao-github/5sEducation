using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface ILearningPathsRepository
{
    Task<List<LearningPathListDto>> GetPublishedAsync(CancellationToken cancellationToken = default);
    Task<LearningPath?> FindBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<int?> GetEnrolledCourseCountAsync(int learningPathId, string? userId, CancellationToken cancellationToken = default);
}

public sealed class LearningPathsRepository : ILearningPathsRepository
{
    private readonly ApplicationDbContext _db;

    public LearningPathsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<LearningPathListDto>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        return await _db.LearningPaths
            .AsNoTracking()
            .Where(p => p.IsPublished)
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => new LearningPathListDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Description = p.Description,
                Level = p.Level,
                ThumbnailUrl = p.ThumbnailUrl,
                EstimatedHours = p.EstimatedHours,
                CourseCount = p.Courses.Count(pc => pc.Course != null && pc.Course.IsPublished),
                IsPublished = p.IsPublished
            })
            .ToListAsync(cancellationToken);
    }

    public Task<LearningPath?> FindBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return _db.LearningPaths
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.Sections)
            .Include(p => p.Courses)
            .ThenInclude(pc => pc.Course)
            .FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
    }

    public async Task<int?> GetEnrolledCourseCountAsync(int learningPathId, string? userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        var courseIdsQuery = _db.LearningPathCourses
            .AsNoTracking()
            .Where(pc => pc.LearningPathId == learningPathId)
            .Select(pc => pc.CourseId);

        return await _db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId && courseIdsQuery.Contains(e.CourseId))
            .Select(e => e.CourseId)
            .Distinct()
            .CountAsync(cancellationToken);
    }
}
