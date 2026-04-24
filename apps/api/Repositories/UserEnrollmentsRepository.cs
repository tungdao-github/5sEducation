using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IUserEnrollmentsRepository
{
    Task<List<EnrollmentDto>> GetMineAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> CourseExistsAsync(int courseId, CancellationToken cancellationToken = default);
    Task<bool> IsCoursePublishedAsync(int courseId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task AddAsync(Enrollment enrollment, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class UserEnrollmentsRepository : IUserEnrollmentsRepository
{
    private readonly ApplicationDbContext _db;

    public UserEnrollmentsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<EnrollmentDto>> GetMineAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EnrollmentDto
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course != null ? e.Course.Title : string.Empty,
                CourseSlug = e.Course != null ? e.Course.Slug : string.Empty,
                ThumbnailUrl = e.Course != null ? e.Course.ThumbnailUrl : string.Empty,
                CreatedAt = e.CreatedAt,
                LastLessonId = e.LastLessonId,
                TotalLessons = e.Course != null ? e.Course.Lessons.Count : 0,
                CompletedLessons = e.LessonProgresses.Count,
                ProgressPercent = e.Course != null && e.Course.Lessons.Count > 0
                    ? Math.Round(e.LessonProgresses.Count * 100d / e.Course.Lessons.Count, 1)
                    : 0
            })
            .ToListAsync(cancellationToken);
    }

    public Task<bool> CourseExistsAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Courses.AnyAsync(c => c.Id == courseId, cancellationToken);
    }

    public Task<bool> IsCoursePublishedAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Courses.AnyAsync(c => c.Id == courseId && c.IsPublished, cancellationToken);
    }

    public Task<bool> ExistsAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId, cancellationToken);
    }

    public Task AddAsync(Enrollment enrollment, CancellationToken cancellationToken = default)
    {
        _db.Enrollments.Add(enrollment);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
