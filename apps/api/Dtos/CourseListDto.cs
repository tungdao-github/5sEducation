namespace UdemyClone.Api.Dtos;

public class CourseListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal EffectivePrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public bool IsFlashSaleActive { get; set; }
    public decimal? FlashSalePrice { get; set; }
    public DateTime? FlashSaleStartsAt { get; set; }
    public DateTime? FlashSaleEndsAt { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int StudentCount { get; set; }
    public CategoryDto? Category { get; set; }
}
