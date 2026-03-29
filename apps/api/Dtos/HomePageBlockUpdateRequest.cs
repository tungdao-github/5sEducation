using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class HomePageBlockUpdateRequest
{
    [Required, MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(400)]
    public string Subtitle { get; set; } = string.Empty;

    [Url, MaxLength(2048)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string CtaText { get; set; } = string.Empty;

    [Url, MaxLength(2048)]
    public string CtaUrl { get; set; } = string.Empty;

    [MaxLength(20000)]
    public string ItemsJson { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Locale { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsPublished { get; set; }
}
