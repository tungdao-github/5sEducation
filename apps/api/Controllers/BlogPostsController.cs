using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/blog/posts")]
public class BlogPostsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public BlogPostsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<BlogPostListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? tag,
        [FromQuery] string? locale,
        [FromQuery] int? take)
    {
        var query = _db.BlogPosts
            .AsNoTracking()
            .Where(p => p.IsPublished)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(locale))
        {
            var normalizedLocale = NormalizeLocale(locale);
            query = query.Where(p => p.Locale == normalizedLocale);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => p.Title.Contains(search) || p.Summary.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            var normalizedTag = tag.Trim();
            query = query.Where(p => p.TagsCsv.Contains(normalizedTag));
        }

        var limit = Math.Clamp(take ?? 0, 0, 200);
        IQueryable<BlogPost> ordered = query.OrderByDescending(p => p.PublishedAt ?? p.CreatedAt);

        if (limit > 0)
        {
            ordered = ordered.Take(limit);
        }

        var posts = await ordered
            .Select(p => new BlogPostListDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Summary = p.Summary,
                CoverImageUrl = p.CoverImageUrl,
                AuthorName = p.AuthorName,
                Tags = SplitTags(p.TagsCsv),
                Locale = p.Locale,
                IsPublished = p.IsPublished,
                CreatedAt = p.CreatedAt,
                PublishedAt = p.PublishedAt
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<BlogPostDetailDto>> GetBySlug(string slug)
    {
        var post = await _db.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug);

        if (post is null)
        {
            return NotFound();
        }

        var isAdmin = User.IsInRole("Admin");
        if (!post.IsPublished && !isAdmin)
        {
            return NotFound();
        }

        return Ok(MapDetail(post));
    }

    [HttpGet("by-id/{id:int}")]
    public async Task<ActionResult<BlogPostDetailDto>> GetById(int id)
    {
        var post = await _db.BlogPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post is null)
        {
            return NotFound();
        }

        if (!post.IsPublished)
        {
            return NotFound();
        }

        return Ok(MapDetail(post));
    }

    private static string NormalizeLocale(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return "en";
        }

        return input.Trim().ToLowerInvariant().StartsWith("vi") ? "vi" : "en";
    }

    private static string[] SplitTags(string? tagsCsv)
    {
        if (string.IsNullOrWhiteSpace(tagsCsv))
        {
            return Array.Empty<string>();
        }

        return tagsCsv
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .ToArray();
    }

    private static BlogPostDetailDto MapDetail(BlogPost post)
    {
        return new BlogPostDetailDto
        {
            Id = post.Id,
            Title = post.Title,
            Slug = post.Slug,
            Summary = post.Summary,
            Content = post.Content,
            CoverImageUrl = post.CoverImageUrl,
            AuthorName = post.AuthorName,
            Tags = SplitTags(post.TagsCsv),
            Locale = post.Locale,
            SeoTitle = post.SeoTitle,
            SeoDescription = post.SeoDescription,
            IsPublished = post.IsPublished,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            PublishedAt = post.PublishedAt
        };
    }
}
