using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/blog")]
public class BlogCommentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public BlogCommentsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("posts/{slug}/comments")]
    public async Task<ActionResult<List<BlogCommentDto>>> GetComments(string slug)
    {
        var post = await _db.BlogPosts.AsNoTracking().FirstOrDefaultAsync(p => p.Slug == slug);
        if (post is null)
        {
            return NotFound();
        }

        string? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        }

        var comments = await _db.BlogComments
            .AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.Likes)
            .Where(c => c.BlogPostId == post.Id)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new BlogCommentDto
            {
                Id = c.Id,
                BlogPostId = c.BlogPostId,
                AuthorName = (c.User == null
                    ? string.Empty
                    : (c.User.FirstName + " " + c.User.LastName).Trim()),
                AuthorAvatarUrl = c.User != null ? c.User.AvatarUrl : null,
                Content = c.Content,
                LikeCount = c.LikeCount,
                IsLikedByUser = userId != null && c.Likes.Any(l => l.UserId == userId),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(comments);
    }

    [Authorize]
    [HttpPost("posts/{slug}/comments")]
    public async Task<ActionResult<BlogCommentDto>> Create(string slug, [FromBody] BlogCommentCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest("Content is required.");
        }

        var post = await _db.BlogPosts.FirstOrDefaultAsync(p => p.Slug == slug);
        if (post is null)
        {
            return NotFound();
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var comment = new BlogComment
        {
            BlogPostId = post.Id,
            UserId = userId,
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.BlogComments.Add(comment);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        var dto = new BlogCommentDto
        {
            Id = comment.Id,
            BlogPostId = comment.BlogPostId,
            AuthorName = user == null ? string.Empty : ($"{user.FirstName} {user.LastName}").Trim(),
            AuthorAvatarUrl = user?.AvatarUrl,
            Content = comment.Content,
            LikeCount = 0,
            IsLikedByUser = false,
            CreatedAt = comment.CreatedAt
        };

        return Ok(dto);
    }

    [Authorize]
    [HttpPost("comments/{id:int}/like")]
    public async Task<ActionResult<BlogCommentLikeDto>> ToggleLike(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var comment = await _db.BlogComments
            .Include(c => c.Likes)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (comment is null)
        {
            return NotFound();
        }

        var existing = await _db.BlogCommentLikes
            .FirstOrDefaultAsync(l => l.BlogCommentId == id && l.UserId == userId);

        if (existing is null)
        {
            _db.BlogCommentLikes.Add(new BlogCommentLike
            {
                BlogCommentId = id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            });
            comment.LikeCount += 1;
        }
        else
        {
            _db.BlogCommentLikes.Remove(existing);
            comment.LikeCount = Math.Max(0, comment.LikeCount - 1);
        }

        await _db.SaveChangesAsync();

        return Ok(new BlogCommentLikeDto
        {
            CommentId = id,
            LikeCount = comment.LikeCount,
            IsLiked = existing is null
        });
    }
}
