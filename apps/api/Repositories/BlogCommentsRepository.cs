using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IBlogCommentsRepository
{
    Task<BlogPost?> FindPostBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<BlogCommentDto>> GetCommentsAsync(int postId, string? userId, CancellationToken cancellationToken = default);
    Task<ApplicationUser?> FindUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<BlogComment?> FindCommentAsync(int id, CancellationToken cancellationToken = default);
    Task<BlogCommentLike?> FindLikeAsync(int commentId, string userId, CancellationToken cancellationToken = default);
    Task AddCommentAsync(BlogComment comment, CancellationToken cancellationToken = default);
    Task AddLikeAsync(BlogCommentLike like, CancellationToken cancellationToken = default);
    Task RemoveLikeAsync(BlogCommentLike like, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class BlogCommentsRepository : IBlogCommentsRepository
{
    private readonly ApplicationDbContext _db;

    public BlogCommentsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<BlogPost?> FindPostBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return _db.BlogPosts.AsNoTracking().FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
    }

    public async Task<List<BlogCommentDto>> GetCommentsAsync(int postId, string? userId, CancellationToken cancellationToken = default)
    {
        return await _db.BlogComments
            .AsNoTracking()
            .Where(c => c.BlogPostId == postId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new BlogCommentDto
            {
                Id = c.Id,
                BlogPostId = c.BlogPostId,
                AuthorName = (c.User == null ? string.Empty : (c.User.FirstName + " " + c.User.LastName).Trim()),
                AuthorAvatarUrl = c.User != null ? c.User.AvatarUrl : null,
                Content = c.Content,
                LikeCount = c.LikeCount,
                IsLikedByUser = userId != null && c.Likes.Any(l => l.UserId == userId),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task<ApplicationUser?> FindUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    public Task<BlogComment?> FindCommentAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.BlogComments.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public Task<BlogCommentLike?> FindLikeAsync(int commentId, string userId, CancellationToken cancellationToken = default)
    {
        return _db.BlogCommentLikes.FirstOrDefaultAsync(l => l.BlogCommentId == commentId && l.UserId == userId, cancellationToken);
    }

    public Task AddCommentAsync(BlogComment comment, CancellationToken cancellationToken = default)
    {
        _db.BlogComments.Add(comment);
        return Task.CompletedTask;
    }

    public Task AddLikeAsync(BlogCommentLike like, CancellationToken cancellationToken = default)
    {
        _db.BlogCommentLikes.Add(like);
        return Task.CompletedTask;
    }

    public Task RemoveLikeAsync(BlogCommentLike like, CancellationToken cancellationToken = default)
    {
        _db.BlogCommentLikes.Remove(like);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
