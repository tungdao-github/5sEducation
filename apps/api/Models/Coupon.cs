using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UdemyClone.Api.Models;

public class Coupon
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Description { get; set; }

    [Required, MaxLength(20)]
    public string Type { get; set; } = "fixed";

    [Column(TypeName = "decimal(10,2)")]
    public decimal Value { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal MinOrder { get; set; }

    public int MaxUses { get; set; }
    public int UsedCount { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
