using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Repositories;

public interface IAdminReviewsRepository
{
    Task<List<AdminReviewDto>> GetAllAsync(int? courseId, string? query, int take, CancellationToken cancellationToken = default);
    Task<Review?> FindAsync(int id, CancellationToken cancellationToken = default);
    Task RemoveAsync(Review review, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminReviewsRepository : IAdminReviewsRepository
{
    private readonly ApplicationDbContext _db;

    public AdminReviewsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<AdminReviewDto>> GetAllAsync(int? courseId, string? query, int take, CancellationToken cancellationToken = default)
    {
        var reviews = _db.Reviews
            .AsNoTracking()
            .Include(r => r.Course)
            .Include(r => r.User)
            .AsQueryable();

        if (courseId.HasValue && courseId.Value > 0)
        {
            reviews = reviews.Where(r => r.CourseId == courseId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = $"%{query.Trim()}%";
            reviews = reviews.Where(r =>
                (r.Comment != null && EF.Functions.Like(r.Comment, q))
                || (r.User != null && r.User.Email != null && EF.Functions.Like(r.User.Email, q))
                || (r.Course != null && EF.Functions.Like(r.Course.Title, q)));
        }

        return (await reviews
            .OrderByDescending(r => r.CreatedAt)
            .Take(take)
            .ToListAsync(cancellationToken))
            .Select(AdminReviewHelper.MapReview)
            .ToList();
    }

    public Task<Review?> FindAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Reviews.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
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
