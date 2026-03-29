using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class LearningPathUpdateRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Level { get; set; } = string.Empty;

    [Url, MaxLength(2048)]
    public string ThumbnailUrl { get; set; } = string.Empty;

    [Range(1, 2000)]
    public int EstimatedHours { get; set; }

    public bool IsPublished { get; set; }
}
