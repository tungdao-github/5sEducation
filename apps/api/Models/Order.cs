using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class Order
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    [Required]
    public string Status { get; set; } = "paid";

    public decimal Subtotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal Total { get; set; }

    [MaxLength(50)]
    public string? CouponCode { get; set; }

    [Required]
    public string Currency { get; set; } = "USD";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
