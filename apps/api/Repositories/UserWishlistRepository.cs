using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IUserWishlistRepository
{
    Task<List<WishlistItemDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> CourseExistsAsync(int courseId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task AddAsync(WishlistItem item, CancellationToken cancellationToken = default);
    Task<WishlistItem?> FindAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task RemoveAsync(WishlistItem item, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class UserWishlistRepository : IUserWishlistRepository
{
    private readonly ApplicationDbContext _db;

    public UserWishlistRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<WishlistItemDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _db.WishlistItems
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WishlistItemDto
            {
                Id = w.Id,
                CourseId = w.CourseId,
                CourseTitle = w.Course != null ? w.Course.Title : string.Empty,
                CourseSlug = w.Course != null ? w.Course.Slug : string.Empty,
                ThumbnailUrl = w.Course != null ? w.Course.ThumbnailUrl : string.Empty,
                Price = w.Course != null ? w.Course.Price : 0,
                Level = w.Course != null ? w.Course.Level : string.Empty,
                Language = w.Course != null ? w.Course.Language : string.Empty
            })
            .ToListAsync(cancellationToken);
    }

    public Task<bool> CourseExistsAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Courses.AnyAsync(c => c.Id == courseId, cancellationToken);
    }

    public Task<bool> ExistsAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.WishlistItems.AnyAsync(w => w.UserId == userId && w.CourseId == courseId, cancellationToken);
    }

    public Task AddAsync(WishlistItem item, CancellationToken cancellationToken = default)
    {
        _db.WishlistItems.Add(item);
        return Task.CompletedTask;
    }

    public Task<WishlistItem?> FindAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.WishlistItems.FirstOrDefaultAsync(w => w.UserId == userId && w.CourseId == courseId, cancellationToken);
    }

    public Task RemoveAsync(WishlistItem item, CancellationToken cancellationToken = default)
    {
        _db.WishlistItems.Remove(item);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
