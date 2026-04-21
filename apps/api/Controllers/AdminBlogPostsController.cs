using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/blog/posts")]
[Authorize(Roles = "Admin")]
public class AdminBlogPostsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminBlogPostsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<BlogPostListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? locale,
        [FromQuery] string? status)
    {
        var query = _db.BlogPosts.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(locale))
        {
            var normalizedLocale = NormalizeLocale(locale);
            query = query.Where(p => p.Locale == normalizedLocale);
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

        var posts = await query
            .OrderByDescending(p => p.UpdatedAt)
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

    [HttpPost]
    public async Task<ActionResult<BlogPostDetailDto>> Create([FromBody] BlogPostCreateRequest request)
    {
        var title = TrimTo(request.Title, 200);
        var summary = TrimTo(request.Summary, 500);
        var content = (request.Content ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(title)
            || string.IsNullOrWhiteSpace(summary)
            || string.IsNullOrWhiteSpace(content))
        {
            return BadRequest("Title, summary, and content are required.");
        }

        var slugSource = string.IsNullOrWhiteSpace(request.Slug) ? title : request.Slug;
        var slug = SlugHelper.Slugify(slugSource ?? string.Empty);

        if (string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest("Slug is required.");
        }

        var exists = await _db.BlogPosts.AnyAsync(p => p.Slug == slug);
        if (exists)
        {
            return Conflict("Slug already exists.");
        }

        var normalizedLocale = NormalizeLocale(request.Locale);
        var normalizedTags = NormalizeTags(request.Tags);
        var publishedAt = ResolvePublishedAt(request.IsPublished, request.PublishedAt);

        var post = new BlogPost
        {
            Title = title,
            Slug = slug,
            Summary = summary,
            Content = content,
            CoverImageUrl = TrimTo(request.CoverImageUrl, 2000),
            AuthorName = TrimTo(request.AuthorName, 160),
            TagsCsv = TrimTo(normalizedTags, 500),
            Locale = normalizedLocale,
            SeoTitle = TrimTo(request.SeoTitle, 200),
            SeoDescription = TrimTo(request.SeoDescription, 1000),
            IsPublished = request.IsPublished,
            PublishedAt = publishedAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.BlogPosts.Add(post);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = post.Id }, MapDetail(post));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BlogPostDetailDto>> GetById(int id)
    {
        var post = await _db.BlogPosts.FindAsync(id);
        if (post is null)
        {
            return NotFound();
        }

        return Ok(MapDetail(post));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] BlogPostUpdateRequest request)
    {
        var post = await _db.BlogPosts.FindAsync(id);
        if (post is null)
        {
            return NotFound();
        }

        var title = TrimTo(request.Title, 200);
        var summary = TrimTo(request.Summary, 500);
        var content = (request.Content ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(title)
            || string.IsNullOrWhiteSpace(summary)
            || string.IsNullOrWhiteSpace(content))
        {
            return BadRequest("Title, summary, and content are required.");
        }

        var slugSource = string.IsNullOrWhiteSpace(request.Slug) ? title : request.Slug;
        var slug = SlugHelper.Slugify(slugSource ?? string.Empty);

        if (string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest("Slug is required.");
        }

        var slugExists = await _db.BlogPosts.AnyAsync(p => p.Slug == slug && p.Id != id);
        if (slugExists)
        {
            return Conflict("Slug already exists.");
        }

        post.Title = title;
        post.Slug = slug;
        post.Summary = summary;
        post.Content = content;
        post.CoverImageUrl = TrimTo(request.CoverImageUrl, 2000);
        post.AuthorName = TrimTo(request.AuthorName, 160);
        post.TagsCsv = TrimTo(NormalizeTags(request.Tags), 500);
        post.Locale = NormalizeLocale(request.Locale);
        post.SeoTitle = TrimTo(request.SeoTitle, 200);
        post.SeoDescription = TrimTo(request.SeoDescription, 1000);
        post.IsPublished = request.IsPublished;
        post.PublishedAt = ResolvePublishedAt(request.IsPublished, request.PublishedAt);
        post.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var post = await _db.BlogPosts.FindAsync(id);
        if (post is null)
        {
            return NotFound();
        }

        _db.BlogPosts.Remove(post);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static string NormalizeLocale(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return "en";
        }

        return input.Trim().ToLowerInvariant().StartsWith("vi") ? "vi" : "en";
    }

    private static string NormalizeTags(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var parts = input
            .Split(new[] { ',', ';', '|', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(tag => tag.Trim())
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return string.Join(", ", parts);
    }

    private static DateTime? ResolvePublishedAt(bool isPublished, DateTime? input)
    {
        if (!isPublished)
        {
            return null;
        }

        return input ?? DateTime.UtcNow;
    }

    private static string TrimTo(string? value, int max)
    {
        var trimmed = (value ?? string.Empty).Trim();
        if (trimmed.Length <= max)
        {
            return trimmed;
        }

        return trimmed[..max];
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
