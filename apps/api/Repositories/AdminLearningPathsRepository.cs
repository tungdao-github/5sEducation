using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminLearningPathsRepository
{
    Task<List<LearningPathListDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<LearningPath?> FindByIdAsync(int id, bool includeGraph = false, CancellationToken cancellationToken = default);
    Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<LearningPathSection?> FindSectionAsync(int sectionId, CancellationToken cancellationToken = default);
    Task<LearningPathCourse?> FindCourseLinkAsync(int pathCourseId, CancellationToken cancellationToken = default);
    Task<Course?> FindCourseAsync(int courseId, CancellationToken cancellationToken = default);
    Task AddAsync<T>(T entity, CancellationToken cancellationToken = default) where T : class;
    Task RemoveAsync<T>(T entity, CancellationToken cancellationToken = default) where T : class;
    Task RemoveRangeAsync<T>(IEnumerable<T> entities, CancellationToken cancellationToken = default) where T : class;
    Task TouchAsync(int learningPathId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminLearningPathsRepository : IAdminLearningPathsRepository
{
    private readonly ApplicationDbContext _db;

    public AdminLearningPathsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<LearningPathListDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.LearningPaths
            .AsNoTracking()
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
                CourseCount = p.Courses.Count,
                IsPublished = p.IsPublished
            })
            .ToListAsync(cancellationToken);
    }

    public Task<LearningPath?> FindByIdAsync(int id, bool includeGraph = false, CancellationToken cancellationToken = default)
    {
        IQueryable<LearningPath> query = _db.LearningPaths;
        if (includeGraph)
        {
            query = query
                .AsNoTracking()
                .AsSplitQuery()
                .Include(p => p.Sections)
                .Include(p => p.Courses)
                .ThenInclude(pc => pc.Course);
        }

        return query.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _db.LearningPaths.AsNoTracking().Where(p => p.Slug == slug);
        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public Task<LearningPathSection?> FindSectionAsync(int sectionId, CancellationToken cancellationToken = default)
    {
        return _db.LearningPathSections.FindAsync([sectionId], cancellationToken).AsTask();
    }

    public Task<LearningPathCourse?> FindCourseLinkAsync(int pathCourseId, CancellationToken cancellationToken = default)
    {
        return _db.LearningPathCourses.FindAsync([pathCourseId], cancellationToken).AsTask();
    }

    public Task<Course?> FindCourseAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courseId, cancellationToken);
    }

    public Task AddAsync<T>(T entity, CancellationToken cancellationToken = default) where T : class
    {
        _db.Set<T>().Add(entity);
        return Task.CompletedTask;
    }

    public Task RemoveAsync<T>(T entity, CancellationToken cancellationToken = default) where T : class
    {
        _db.Set<T>().Remove(entity);
        return Task.CompletedTask;
    }

    public Task RemoveRangeAsync<T>(IEnumerable<T> entities, CancellationToken cancellationToken = default) where T : class
    {
        _db.Set<T>().RemoveRange(entities);
        return Task.CompletedTask;
    }

    public async Task TouchAsync(int learningPathId, CancellationToken cancellationToken = default)
    {
        var path = await _db.LearningPaths.FirstOrDefaultAsync(p => p.Id == learningPathId, cancellationToken);
        if (path is null)
        {
            return;
        }

        path.UpdatedAt = DateTime.UtcNow;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
