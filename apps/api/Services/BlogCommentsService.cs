using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class BlogCommentsService
{
    private readonly IBlogCommentsRepository _repository;

    public BlogCommentsService(IBlogCommentsRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<BlogCommentDto>?> GetCommentsAsync(string slug, string? userId, CancellationToken cancellationToken = default)
    {
        var post = await _repository.FindPostBySlugAsync(slug, cancellationToken);
        if (post is null)
        {
            return null;
        }

        return await _repository.GetCommentsAsync(post.Id, userId, cancellationToken);
    }

    public async Task<BlogCommentDto?> CreateAsync(string slug, string userId, string content, CancellationToken cancellationToken = default)
    {
        var post = await _repository.FindPostBySlugAsync(slug, cancellationToken);
        if (post is null)
        {
            return null;
        }

        var user = await _repository.FindUserAsync(userId, cancellationToken);
        var comment = new BlogComment
        {
            BlogPostId = post.Id,
            UserId = userId,
            Content = content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddCommentAsync(comment, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return new BlogCommentDto
        {
            Id = comment.Id,
            BlogPostId = comment.BlogPostId,
            AuthorName = user == null ? string.Empty : $"{user.FirstName} {user.LastName}".Trim(),
            AuthorAvatarUrl = user?.AvatarUrl,
            Content = comment.Content,
            LikeCount = 0,
            IsLikedByUser = false,
            CreatedAt = comment.CreatedAt
        };
    }

    public async Task<BlogCommentLikeDto?> ToggleLikeAsync(int id, string userId, CancellationToken cancellationToken = default)
    {
        var comment = await _repository.FindCommentAsync(id, cancellationToken);
        if (comment is null)
        {
            return null;
        }

        var existing = await _repository.FindLikeAsync(id, userId, cancellationToken);
        if (existing is null)
        {
            await _repository.AddLikeAsync(new BlogCommentLike
            {
                BlogCommentId = id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
            comment.LikeCount += 1;
        }
        else
        {
            await _repository.RemoveLikeAsync(existing, cancellationToken);
            comment.LikeCount = Math.Max(0, comment.LikeCount - 1);
        }

        await _repository.SaveChangesAsync(cancellationToken);
        return new BlogCommentLikeDto
        {
            CommentId = id,
            LikeCount = comment.LikeCount,
            IsLiked = existing is null
        };
    }
}
