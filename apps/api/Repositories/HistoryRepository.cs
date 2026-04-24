using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IHistoryRepository
{
    Task<Course?> FindCourseAsync(int courseId, CancellationToken cancellationToken = default);
    Task<CourseViewHistory?> FindViewAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task UpsertViewAsync(CourseViewHistory history, CancellationToken cancellationToken = default);
    Task<List<CourseHistoryDto>> GetViewsAsync(string userId, int take, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class HistoryRepository : IHistoryRepository
{
    private readonly ApplicationDbContext _db;

    public HistoryRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<Course?> FindCourseAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courseId, cancellationToken);
    }

    public Task<CourseViewHistory?> FindViewAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.CourseViewHistories.FirstOrDefaultAsync(v => v.UserId == userId && v.CourseId == courseId, cancellationToken);
    }

    public Task UpsertViewAsync(CourseViewHistory history, CancellationToken cancellationToken = default)
    {
        if (history.Id == 0)
        {
            _db.CourseViewHistories.Add(history);
        }

        return Task.CompletedTask;
    }

    public async Task<List<CourseHistoryDto>> GetViewsAsync(string userId, int take, CancellationToken cancellationToken = default)
    {
        return await _db.CourseViewHistories
            .AsNoTracking()
            .Where(v => v.UserId == userId)
            .OrderByDescending(v => v.ViewedAt)
            .Take(take)
            .Select(v => new CourseHistoryDto
            {
                Id = v.CourseId,
                Title = v.Course != null ? v.Course.Title : string.Empty,
                Slug = v.Course != null ? v.Course.Slug : string.Empty,
                ShortDescription = v.Course != null ? v.Course.ShortDescription : string.Empty,
                Price = v.Course != null ? v.Course.Price : 0,
                ThumbnailUrl = v.Course != null ? v.Course.ThumbnailUrl : string.Empty,
                Language = v.Course != null ? v.Course.Language : string.Empty,
                Level = v.Course != null ? v.Course.Level : string.Empty,
                AverageRating = v.Course != null
                    ? v.Course.Reviews.Select(r => (double?)r.Rating).Average() ?? 0
                    : 0,
                ReviewCount = v.Course != null ? v.Course.Reviews.Count : 0,
                StudentCount = v.Course != null ? v.Course.Enrollments.Count : 0,
                Category = v.Course != null && v.Course.Category != null
                    ? new CategoryDto
                    {
                        Id = v.Course.Category.Id,
                        Title = v.Course.Category.Title,
                        Slug = v.Course.Category.Slug
                    }
                    : null,
                ViewedAt = v.ViewedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
