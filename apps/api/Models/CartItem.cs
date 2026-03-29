using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class CartItem
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    [Required]
    public int CourseId { get; set; }
    public Course? Course { get; set; }

    [Range(1, 20)]
    public int Quantity { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
