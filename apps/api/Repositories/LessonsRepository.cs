using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using UdemyClone.Api.Data;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface ILessonsRepository
{
    Task<Course?> FindCourseAsync(int courseId, CancellationToken cancellationToken = default);
    Task<bool> IsEnrolledAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task<List<Lesson>> GetByCourseAsync(int courseId, CancellationToken cancellationToken = default);
    Task<Lesson?> FindWithCourseAsync(int id, CancellationToken cancellationToken = default);
    Task<Lesson?> FindWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<Enrollment?> FindEnrollmentAsync(string userId, int courseId, bool includeProgresses = false, CancellationToken cancellationToken = default);
    Task<LessonExerciseAttempt?> FindLatestAttemptAsync(int enrollmentId, int lessonId, CancellationToken cancellationToken = default);
    Task<int> CountAttemptsAsync(int enrollmentId, int lessonId, CancellationToken cancellationToken = default);
    Task<bool> HasPassedAttemptAsync(int enrollmentId, int lessonId, CancellationToken cancellationToken = default);
    Task<double> GetBestScoreAsync(int enrollmentId, int lessonId, CancellationToken cancellationToken = default);
    Task AddLessonAsync(Lesson lesson, CancellationToken cancellationToken = default);
    Task RemoveLessonAsync(Lesson lesson, CancellationToken cancellationToken = default);
    Task AddAttemptAsync(LessonExerciseAttempt attempt, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
}

public sealed class LessonsRepository : ILessonsRepository
{
    private readonly ApplicationDbContext _db;

    public LessonsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<Course?> FindCourseAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courseId, cancellationToken);
    }

    public Task<bool> IsEnrolledAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Enrollments.AsNoTracking().AnyAsync(e => e.UserId == userId && e.CourseId == courseId, cancellationToken);
    }

    public async Task<List<Lesson>> GetByCourseAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return await _db.Lessons
            .AsNoTracking()
            .AsSplitQuery()
            .Include(l => l.ExerciseQuestions)
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public Task<Lesson?> FindWithCourseAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Lessons
            .AsSplitQuery()
            .Include(l => l.Course)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public Task<Lesson?> FindWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Lessons
            .AsNoTracking()
            .AsSplitQuery()
            .Include(l => l.Course)
            .Include(l => l.ExerciseQuestions)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public Task<Enrollment?> FindEnrollmentAsync(string userId, int courseId, bool includeProgresses = false, CancellationToken cancellationToken = default)
    {
        IQueryable<Enrollment> query = _db.Enrollments;
        if (includeProgresses)
        {
            query = query.Include(e => e.LessonProgresses);
        }

        return query.FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, cancellationToken);
    }

    public Task<LessonExerciseAttempt?> FindLatestAttemptAsync(int enrollmentId, int lessonId, CancellationToken cancellationToken = default)
    {
        return _db.LessonExerciseAttempts
            .AsNoTracking()
            .Where(a => a.EnrollmentId == enrollmentId && a.LessonId == lessonId)
            .OrderByDescending(a => a.AttemptedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<int> CountAttemptsAsync(int enrollmentId, int lessonId, CancellationToken cancellationToken = default)
    {
        return _db.LessonExerciseAttempts.CountAsync(a => a.EnrollmentId == enrollmentId && a.LessonId == lessonId, cancellationToken);
    }

    public Task<bool> HasPassedAttemptAsync(int enrollmentId, int lessonId, CancellationToken cancellationToken = default)
    {
        return _db.LessonExerciseAttempts.AnyAsync(a => a.EnrollmentId == enrollmentId && a.LessonId == lessonId && (a.Passed || a.IsCorrect), cancellationToken);
    }

    public async Task<double> GetBestScoreAsync(int enrollmentId, int lessonId, CancellationToken cancellationToken = default)
    {
        return await _db.LessonExerciseAttempts
            .AsNoTracking()
            .Where(a => a.EnrollmentId == enrollmentId && a.LessonId == lessonId)
            .Select(a => a.TotalQuestions > 0 ? a.ScorePercent : (a.IsCorrect ? 100d : 0d))
            .DefaultIfEmpty(0d)
            .MaxAsync(cancellationToken);
    }

    public Task AddLessonAsync(Lesson lesson, CancellationToken cancellationToken = default)
    {
        _db.Lessons.Add(lesson);
        return Task.CompletedTask;
    }

    public Task RemoveLessonAsync(Lesson lesson, CancellationToken cancellationToken = default)
    {
        _db.Lessons.Remove(lesson);
        return Task.CompletedTask;
    }

    public Task AddAttemptAsync(LessonExerciseAttempt attempt, CancellationToken cancellationToken = default)
    {
        _db.LessonExerciseAttempts.Add(attempt);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        return _db.Database.BeginTransactionAsync(cancellationToken);
    }
}
