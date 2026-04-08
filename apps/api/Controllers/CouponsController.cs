using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CouponsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("validate")]
    public async Task<ActionResult<CouponValidateResponseDto>> Validate([FromQuery] string code, [FromQuery] decimal? subtotal)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return BadRequest(new CouponValidateResponseDto
            {
                IsValid = false,
                Message = "Coupon code is required."
            });
        }

        var normalized = code.Trim().ToUpperInvariant();
        var coupon = await _db.Coupons.FirstOrDefaultAsync(c => c.Code == normalized);
        if (coupon is null)
        {
            return Ok(new CouponValidateResponseDto
            {
                IsValid = false,
                Message = "Invalid coupon code."
            });
        }

        var now = DateTime.UtcNow;
        var baseSubtotal = subtotal ?? 0;
        var validation = ValidateCoupon(coupon, baseSubtotal, now);
        if (!validation.IsValid)
        {
            return Ok(new CouponValidateResponseDto
            {
                IsValid = false,
                Message = validation.Message,
                Coupon = MapCoupon(coupon),
                Discount = 0,
                NewTotal = baseSubtotal
            });
        }

        var discount = validation.Discount;
        return Ok(new CouponValidateResponseDto
        {
            IsValid = true,
            Message = "Coupon applied.",
            Coupon = MapCoupon(coupon),
            Discount = discount,
            NewTotal = Math.Max(0, baseSubtotal - discount)
        });
    }

    private static CouponDto MapCoupon(Coupon coupon)
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

    private static (bool IsValid, string? Message, decimal Discount) ValidateCoupon(Coupon coupon, decimal subtotal, DateTime now)
    {
        if (!coupon.IsActive)
        {
            return (false, "Coupon is disabled.", 0);
        }

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < now)
        {
            return (false, "Coupon has expired.", 0);
        }

        if (coupon.MaxUses > 0 && coupon.UsedCount >= coupon.MaxUses)
        {
            return (false, "Coupon usage limit reached.", 0);
        }

        if (coupon.MinOrder > 0 && subtotal < coupon.MinOrder)
        {
            return (false, "Order total does not meet coupon requirements.", 0);
        }

        var discount = 0m;
        if (string.Equals(coupon.Type, "percent", StringComparison.OrdinalIgnoreCase))
        {
            discount = Math.Round(subtotal * (coupon.Value / 100m), 2, MidpointRounding.AwayFromZero);
        }
        else
        {
            discount = coupon.Value;
        }

        discount = Math.Max(0, Math.Min(discount, subtotal));
        return (true, null, discount);
    }
}
