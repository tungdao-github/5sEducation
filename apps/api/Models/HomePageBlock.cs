namespace UdemyClone.Api.Models;

public class HomePageBlock
{
    public int Id { get; set; }

    public string Key { get; set; } = string.Empty;

    public string Type { get; set; } = "hero";

    public string Title { get; set; } = string.Empty;

    public string Subtitle { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public string CtaText { get; set; } = string.Empty;

    public string CtaUrl { get; set; } = string.Empty;

    public string ItemsJson { get; set; } = string.Empty;

    public string Locale { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsPublished { get; set; }
}
