using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class ReviewCreateRequest
{
    [Required, Range(1, int.MaxValue)]
    public int CourseId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(500)]
    public string Comment { get; set; } = string.Empty;
}
