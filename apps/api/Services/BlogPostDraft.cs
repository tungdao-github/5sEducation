namespace UdemyClone.Api.Services;

public sealed class BlogPostDraft
{
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string Summary { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string? CoverImageUrl { get; init; }
    public string? AuthorName { get; init; }
    public string? TagsCsv { get; init; }
    public string Locale { get; init; } = "en";
    public string? SeoTitle { get; init; }
    public string? SeoDescription { get; init; }
    public bool IsPublished { get; init; }
    public DateTime? PublishedAt { get; init; }
}
