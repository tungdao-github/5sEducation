using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IUserProgressRepository
{
    Task<(int EnrollmentId, int CourseId, int? LastLessonId)?> GetEnrollmentSnapshotAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task<List<int>> GetCompletedLessonIdsAsync(int enrollmentId, CancellationToken cancellationToken = default);
    Task<int> GetTotalLessonsAsync(int courseId, CancellationToken cancellationToken = default);
    Task<Enrollment?> GetEnrollmentForUpdateAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task<bool> LessonBelongsToCourseAsync(int lessonId, int courseId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class UserProgressRepository : IUserProgressRepository
{
    private readonly ApplicationDbContext _db;

    public UserProgressRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<(int EnrollmentId, int CourseId, int? LastLessonId)?> GetEnrollmentSnapshotAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return await _db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId && e.CourseId == courseId)
            .Select(e => new ValueTuple<int, int, int?>(e.Id, e.CourseId, e.LastLessonId))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<int>> GetCompletedLessonIdsAsync(int enrollmentId, CancellationToken cancellationToken = default)
    {
        return await _db.LessonProgresses
            .AsNoTracking()
            .Where(lp => lp.EnrollmentId == enrollmentId)
            .Select(lp => lp.LessonId)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public Task<int> GetTotalLessonsAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Lessons.AsNoTracking().CountAsync(l => l.CourseId == courseId, cancellationToken);
    }

    public Task<Enrollment?> GetEnrollmentForUpdateAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Enrollments
            .Include(e => e.LessonProgresses)
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, cancellationToken);
    }

    public Task<bool> LessonBelongsToCourseAsync(int lessonId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Lessons.AsNoTracking().AnyAsync(l => l.Id == lessonId && l.CourseId == courseId, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
