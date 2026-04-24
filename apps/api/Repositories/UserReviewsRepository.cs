using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IUserReviewsRepository
{
    Task<List<ReviewDto>> GetByCourseAsync(int courseId, CancellationToken cancellationToken = default);
    Task<bool> CourseExistsAsync(int courseId, CancellationToken cancellationToken = default);
    Task<bool> IsEnrolledAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task<Review?> FindAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task AddAsync(Review review, CancellationToken cancellationToken = default);
    Task RemoveAsync(Review review, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class UserReviewsRepository : IUserReviewsRepository
{
    private readonly ApplicationDbContext _db;

    public UserReviewsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<ReviewDto>> GetByCourseAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return await _db.Reviews
            .AsNoTracking()
            .Where(r => r.CourseId == courseId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UserId = r.UserId,
                UserName = r.User == null
                    ? "Learner"
                    : string.IsNullOrWhiteSpace(r.User.FirstName)
                        ? r.User.Email ?? "Learner"
                        : $"{r.User.FirstName} {r.User.LastName}".Trim()
            })
            .ToListAsync(cancellationToken);
    }

    public Task<bool> CourseExistsAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Courses.AnyAsync(c => c.Id == courseId, cancellationToken);
    }

    public Task<bool> IsEnrolledAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId, cancellationToken);
    }

    public Task<Review?> FindAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Reviews.FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == courseId, cancellationToken);
    }

    public Task AddAsync(Review review, CancellationToken cancellationToken = default)
    {
        _db.Reviews.Add(review);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Review review, CancellationToken cancellationToken = default)
    {
        _db.Reviews.Remove(review);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
