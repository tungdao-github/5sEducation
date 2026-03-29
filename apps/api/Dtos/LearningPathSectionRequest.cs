using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class LearningPathSectionRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 1000)]
    public int SortOrder { get; set; }
}
