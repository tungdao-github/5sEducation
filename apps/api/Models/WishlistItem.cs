using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class WishlistItem
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public int CourseId { get; set; }
    public Course? Course { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
