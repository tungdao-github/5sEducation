namespace UdemyClone.Api.Dtos;

public class CourseManageDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public decimal? FlashSalePrice { get; set; }

    public DateTime? FlashSaleStartsAt { get; set; }

    public DateTime? FlashSaleEndsAt { get; set; }

    public string ThumbnailUrl { get; set; } = string.Empty;

    public string Level { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public bool IsPublished { get; set; }

    public int StudentCount { get; set; }

    public double AverageRating { get; set; }

    public int ReviewCount { get; set; }

    public decimal Revenue { get; set; }

    public int TotalLessons { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public CategoryDto? Category { get; set; }

    public string? InstructorName { get; set; }

    public string? InstructorAvatarUrl { get; set; }
}
