using UdemyClone.Api.Dtos;
using UdemyClone.Api.Common;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static class BlogPostHelper
{
    public static BlogPostDraft? BuildDraft(BlogPostCreateRequest request)
    {
        var title = TrimTo(request.Title, 200);
        var summary = TrimTo(request.Summary, 500);
        var content = (request.Content ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(title)
            || string.IsNullOrWhiteSpace(summary)
            || string.IsNullOrWhiteSpace(content))
        {
            return null;
        }

        var slugSource = string.IsNullOrWhiteSpace(request.Slug) ? title : request.Slug;
        var slug = SlugHelper.Slugify(slugSource ?? string.Empty);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return null;
        }

        return new BlogPostDraft
        {
            Title = title,
            Slug = slug,
            Summary = summary,
            Content = content,
            CoverImageUrl = TrimTo(request.CoverImageUrl, 2000),
            AuthorName = TrimTo(request.AuthorName, 160),
            TagsCsv = TrimTo(NormalizeTags(request.Tags), 500),
            Locale = NormalizeLocale(request.Locale),
            SeoTitle = TrimTo(request.SeoTitle, 200),
            SeoDescription = TrimTo(request.SeoDescription, 1000),
            IsPublished = request.IsPublished,
            PublishedAt = ResolvePublishedAt(request.IsPublished, request.PublishedAt)
        };
    }

    public static BlogPostDraft? BuildDraft(BlogPostUpdateRequest request)
    {
        return BuildDraft(new BlogPostCreateRequest
        {
            Title = request.Title,
            Slug = request.Slug,
            Summary = request.Summary,
            Content = request.Content,
            CoverImageUrl = request.CoverImageUrl,
            AuthorName = request.AuthorName,
            Tags = request.Tags,
            Locale = request.Locale,
            SeoTitle = request.SeoTitle,
            SeoDescription = request.SeoDescription,
            IsPublished = request.IsPublished,
            PublishedAt = request.PublishedAt
        });
    }

    public static string NormalizeLocale(string? input)
    {
        return BlogLocaleHelper.NormalizeLocale(input);
    }

    public static string NormalizeTags(string? input)
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

    public static DateTime? ResolvePublishedAt(bool isPublished, DateTime? input)
    {
        if (!isPublished)
        {
            return null;
        }

        return input ?? DateTime.UtcNow;
    }

    public static string TrimTo(string? value, int max)
    {
        var trimmed = (value ?? string.Empty).Trim();
        if (trimmed.Length <= max)
        {
            return trimmed;
        }

        return trimmed[..max];
    }

    public static string[] SplitTags(string? tagsCsv)
    {
        if (string.IsNullOrWhiteSpace(tagsCsv))
        {
            return [];
        }

        return tagsCsv
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .ToArray();
    }

    public static BlogPostListDto MapList(BlogPost post)
    {
        return new BlogPostListDto
        {
            Id = post.Id,
            Title = post.Title,
            Slug = post.Slug,
            Summary = post.Summary,
            CoverImageUrl = post.CoverImageUrl,
            AuthorName = post.AuthorName,
            Tags = SplitTags(post.TagsCsv),
            Locale = post.Locale,
            IsPublished = post.IsPublished,
            CreatedAt = post.CreatedAt,
            PublishedAt = post.PublishedAt
        };
    }

    public static BlogPostDetailDto MapDetail(BlogPost post)
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
