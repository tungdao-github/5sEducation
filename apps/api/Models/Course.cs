using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UdemyClone.Api.Models;

public class Course
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    public string InstructorId { get; set; } = string.Empty;
    public ApplicationUser? Instructor { get; set; }

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

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

    [Column(TypeName = "decimal(10,2)")]
    [Range(9.99, 99999)]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    [Range(0.0, 99999)]
    public decimal? FlashSalePrice { get; set; }

    public DateTime? FlashSaleStartsAt { get; set; }

    public DateTime? FlashSaleEndsAt { get; set; }

    [Required, MaxLength(20)]
    public string Level { get; set; } = "Beginner";

    [MaxLength(255)]
    public string ThumbnailUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string PreviewVideoUrl { get; set; } = string.Empty;

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
