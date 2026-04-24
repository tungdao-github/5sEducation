using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Common;
using UdemyClone.Api.Data;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminBlogPostsRepository
{
    Task<List<BlogPost>> GetAllAsync(string? search, string? locale, string? status, CancellationToken cancellationToken = default);
    Task<bool> SlugExistsAsync(string slug, int? excludingId = null, CancellationToken cancellationToken = default);
    Task AddAsync(BlogPost post, CancellationToken cancellationToken = default);
    Task<BlogPost?> FindByIdAsync(int id, CancellationToken cancellationToken = default);
    Task RemoveAsync(BlogPost post, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminBlogPostsRepository : IAdminBlogPostsRepository
{
    private readonly ApplicationDbContext _db;

    public AdminBlogPostsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<BlogPost>> GetAllAsync(string? search, string? locale, string? status, CancellationToken cancellationToken = default)
    {
        var query = _db.BlogPosts.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(locale))
        {
            query = query.Where(p => p.Locale == BlogLocaleHelper.NormalizeLocale(locale));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = $"%{search.Trim()}%";
            query = query.Where(p => EF.Functions.Like(p.Title, q) || EF.Functions.Like(p.Summary, q));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalizedStatus = status.Trim().ToLowerInvariant();
            if (normalizedStatus == "published")
            {
                query = query.Where(p => p.IsPublished);
            }
            else if (normalizedStatus == "draft")
            {
                query = query.Where(p => !p.IsPublished);
            }
        }

        return await query
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> SlugExistsAsync(string slug, int? excludingId = null, CancellationToken cancellationToken = default)
    {
        return excludingId.HasValue
            ? _db.BlogPosts.AnyAsync(p => p.Slug == slug && p.Id != excludingId.Value, cancellationToken)
            : _db.BlogPosts.AnyAsync(p => p.Slug == slug, cancellationToken);
    }

    public Task AddAsync(BlogPost post, CancellationToken cancellationToken = default)
    {
        _db.BlogPosts.Add(post);
        return Task.CompletedTask;
    }

    public Task<BlogPost?> FindByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.BlogPosts.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public Task RemoveAsync(BlogPost post, CancellationToken cancellationToken = default)
    {
        _db.BlogPosts.Remove(post);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
