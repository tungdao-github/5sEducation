using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace UdemyClone.Api.Dtos;

public class CourseUpdateRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public int? CategoryId { get; set; }

    [Required, MaxLength(80)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Outcome { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Requirements { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Language { get; set; } = "English";

    [Range(9.99, 99999)]
    public decimal Price { get; set; }

    [Range(0.0, 99999)]
    public decimal? FlashSalePrice { get; set; }

    public DateTime? FlashSaleStartsAt { get; set; }

    public DateTime? FlashSaleEndsAt { get; set; }

    [Required, MaxLength(20)]
    public string Level { get; set; } = "Beginner";

    [MaxLength(200)]
    public string PreviewVideoUrl { get; set; } = string.Empty;

    public bool IsPublished { get; set; } = true;

    public IFormFile? Thumbnail { get; set; }
}
