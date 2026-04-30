using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static class BlogPostMappingHelper
{
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
