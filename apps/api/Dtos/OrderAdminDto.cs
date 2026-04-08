namespace UdemyClone.Api.Dtos;

public class OrderAdminDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? CouponCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
}
