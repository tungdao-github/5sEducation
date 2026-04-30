using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Common;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IPublicContentRepository
{
    Task<List<HomePageBlockDto>> GetHomePageBlocksAsync(string? locale, CancellationToken cancellationToken = default);
    Task<List<BlogPost>> GetBlogPostsAsync(string? search, string? tag, string? locale, int? take, CancellationToken cancellationToken = default);
    Task<BlogPost?> FindBlogPostBySlugAsync(string slug, string? locale = null, CancellationToken cancellationToken = default);
    Task<BlogPost?> FindBlogPostByIdAsync(int id, string? locale = null, CancellationToken cancellationToken = default);
    Task<List<SearchSuggestionDto>> GetSearchSuggestionsAsync(string term, CancellationToken cancellationToken = default);
    Task<List<SystemSettingDto>> GetSettingsAsync(string? group, string? keys, CancellationToken cancellationToken = default);
    Task<PublicStatsDto> GetPublicStatsAsync(CancellationToken cancellationToken = default);
    Task<List<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default);
}

public sealed class PublicContentRepository : IPublicContentRepository
{
    private readonly ApplicationDbContext _db;

    public PublicContentRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<HomePageBlockDto>> GetHomePageBlocksAsync(string? locale, CancellationToken cancellationToken = default)
    {
        var normalizedLocale = (locale ?? string.Empty).Trim().ToLowerInvariant();

        return await _db.HomePageBlocks
            .AsNoTracking()
            .Where(b => b.IsPublished)
            .Where(b => string.IsNullOrEmpty(b.Locale) || b.Locale == normalizedLocale)
            .OrderBy(b => b.SortOrder)
            .ThenBy(b => b.Id)
            .Select(b => new HomePageBlockDto
            {
                Id = b.Id,
                Key = b.Key,
                Type = b.Type,
                Title = b.Title,
                Subtitle = b.Subtitle,
                ImageUrl = b.ImageUrl,
                CtaText = b.CtaText,
                CtaUrl = b.CtaUrl,
                ItemsJson = b.ItemsJson,
                Locale = b.Locale,
                SortOrder = b.SortOrder,
                IsPublished = b.IsPublished
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<BlogPost>> GetBlogPostsAsync(string? search, string? tag, string? locale, int? take, CancellationToken cancellationToken = default)
    {
        var query = _db.BlogPosts
            .AsNoTracking()
            .Where(p => p.IsPublished)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(locale))
        {
            query = query.Where(p => p.Locale == BlogLocaleHelper.NormalizeLocale(locale));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => p.Title.Contains(search) || p.Summary.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            query = query.Where(p => p.TagsCsv.Contains(tag.Trim()));
        }

        IQueryable<BlogPost> ordered = query.OrderByDescending(p => p.PublishedAt ?? p.CreatedAt);
        var limit = Math.Clamp(take ?? 0, 0, 200);
        if (limit > 0)
        {
            ordered = ordered.Take(limit);
        }

        return await ordered.ToListAsync(cancellationToken);
    }

    public Task<BlogPost?> FindBlogPostBySlugAsync(string slug, string? locale = null, CancellationToken cancellationToken = default)
    {
        var query = _db.BlogPosts.AsNoTracking().Where(p => p.Slug == slug);
        if (!string.IsNullOrWhiteSpace(locale))
        {
            query = query.Where(p => p.Locale == BlogLocaleHelper.NormalizeLocale(locale));
        }
        return query.FirstOrDefaultAsync(cancellationToken);
    }

    public Task<BlogPost?> FindBlogPostByIdAsync(int id, string? locale = null, CancellationToken cancellationToken = default)
    {
        var query = _db.BlogPosts.AsNoTracking().Where(p => p.Id == id);
        if (!string.IsNullOrWhiteSpace(locale))
        {
            query = query.Where(p => p.Locale == BlogLocaleHelper.NormalizeLocale(locale));
        }
        return query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<SearchSuggestionDto>> GetSearchSuggestionsAsync(string term, CancellationToken cancellationToken = default)
    {
        var courseResultsTask = _db.Courses
            .AsNoTracking()
            .Where(c => c.IsPublished && c.Title.Contains(term))
            .OrderByDescending(c => c.UpdatedAt)
            .Take(6)
            .Select(c => new SearchSuggestionDto
            {
                Type = "course",
                Title = c.Title,
                Slug = c.Slug,
                Subtitle = c.Level
            })
            .ToListAsync(cancellationToken);

        var pathResultsTask = _db.LearningPaths
            .AsNoTracking()
            .Where(p => p.IsPublished && p.Title.Contains(term))
            .OrderByDescending(p => p.UpdatedAt)
            .Take(4)
            .Select(p => new SearchSuggestionDto
            {
                Type = "path",
                Title = p.Title,
                Slug = p.Slug,
                Subtitle = p.Level
            })
            .ToListAsync(cancellationToken);

        await Task.WhenAll(courseResultsTask, pathResultsTask);
        return courseResultsTask.Result.Concat(pathResultsTask.Result).Take(8).ToList();
    }

    public async Task<List<SystemSettingDto>> GetSettingsAsync(string? group, string? keys, CancellationToken cancellationToken = default)
    {
        var query = _db.SystemSettings.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(group))
        {
            query = query.Where(s => s.Group == group);
        }

        if (!string.IsNullOrWhiteSpace(keys))
        {
            var keyList = keys
                .Split(",", StringSplitOptions.RemoveEmptyEntries)
                .Select(k => k.Trim())
                .Where(k => k.Length > 0)
                .ToList();

            if (keyList.Count > 0)
            {
                query = query.Where(s => keyList.Contains(s.Key));
            }
        }

        return await query
            .OrderBy(s => s.Group)
            .ThenBy(s => s.Key)
            .Select(s => new SystemSettingDto
            {
                Key = s.Key,
                Value = s.Value,
                Group = s.Group,
                Description = s.Description,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<PublicStatsDto> GetPublicStatsAsync(CancellationToken cancellationToken = default)
    {
        var publishedCourses = _db.Courses
            .AsNoTracking()
            .Where(c => c.IsPublished);

        var totalCourses = await publishedCourses.CountAsync(cancellationToken);
        var totalStudents = await _db.Enrollments.AsNoTracking().Select(e => e.UserId).Distinct().CountAsync(cancellationToken);
        var totalInstructors = await publishedCourses.Where(c => c.InstructorId != null).Select(c => c.InstructorId!).Distinct().CountAsync(cancellationToken);
        var totalReviews = await _db.Reviews.AsNoTracking().CountAsync(cancellationToken);
        var averageRating = await _db.Reviews.AsNoTracking().Select(r => (double?)r.Rating).AverageAsync(cancellationToken) ?? 0;

        return new PublicStatsDto
        {
            TotalCourses = totalCourses,
            TotalStudents = totalStudents,
            TotalInstructors = totalInstructors,
            TotalReviews = totalReviews,
            AverageRating = Math.Round(averageRating, 1)
        };
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.Title)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug
            })
            .ToListAsync(cancellationToken);
    }
}
