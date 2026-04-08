namespace UdemyClone.Api.Dtos;

public class CouponCreateRequest
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "fixed"; // fixed | percent
    public decimal Value { get; set; }
    public decimal MinOrder { get; set; }
    public int MaxUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class CouponUpdateRequest : CouponCreateRequest
{
}

public class CouponValidateResponseDto
{
    public bool IsValid { get; set; }
    public string? Message { get; set; }
    public decimal Discount { get; set; }
    public decimal NewTotal { get; set; }
    public CouponDto? Coupon { get; set; }
}
