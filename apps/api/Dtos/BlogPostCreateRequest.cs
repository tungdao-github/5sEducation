using System;
using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class BlogPostCreateRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    [MaxLength(200)]
    public string? Slug { get; set; }
    [Required, MaxLength(500)]
    public string Summary { get; set; } = string.Empty;
    [Required]
    public string Content { get; set; } = string.Empty;
    [Url, MaxLength(2048)]
    public string CoverImageUrl { get; set; } = string.Empty;
    [Required, MaxLength(160)]
    public string AuthorName { get; set; } = string.Empty;
    [MaxLength(500)]
    public string Tags { get; set; } = string.Empty;
    [MaxLength(10)]
    public string Locale { get; set; } = "en";
    [MaxLength(200)]
    public string SeoTitle { get; set; } = string.Empty;
    [MaxLength(1000)]
    public string SeoDescription { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
}
