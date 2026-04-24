using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static class CouponHelper
{
    public static string NormalizeType(string? input)
    {
        var normalized = (input ?? string.Empty).Trim().ToLowerInvariant();
        return normalized == "percent" ? "percent" : "fixed";
    }

    public static CouponDto MapCoupon(Coupon coupon)
    {
        return new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Type = coupon.Type,
            Value = coupon.Value,
            MinOrder = coupon.MinOrder,
            MaxUses = coupon.MaxUses,
            UsedCount = coupon.UsedCount,
            ExpiresAt = coupon.ExpiresAt,
            IsActive = coupon.IsActive,
            Description = coupon.Description,
            CreatedAt = coupon.CreatedAt,
            UpdatedAt = coupon.UpdatedAt
        };
    }
}
