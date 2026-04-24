using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class CouponValidationService
{
    private readonly ICartRepository _repository;

    public CouponValidationService(ICartRepository repository)
    {
        _repository = repository;
    }

    public async Task<CouponValidateResponseDto> ValidateAsync(string code, decimal? subtotal, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return new CouponValidateResponseDto
            {
                IsValid = false,
                Message = "Coupon code is required."
            };
        }

        var normalized = code.Trim().ToUpperInvariant();
        var coupon = await _repository.FindCouponByCodeAsync(normalized, cancellationToken);
        var baseSubtotal = subtotal ?? 0;
        if (coupon is null)
        {
            return new CouponValidateResponseDto
            {
                IsValid = false,
                Message = "Invalid coupon code.",
                NewTotal = baseSubtotal
            };
        }

        var validation = ValidateCoupon(coupon, baseSubtotal, DateTime.UtcNow);
        if (!validation.IsValid)
        {
            return new CouponValidateResponseDto
            {
                IsValid = false,
                Message = validation.Message,
                Coupon = CouponHelper.MapCoupon(coupon),
                Discount = 0,
                NewTotal = baseSubtotal
            };
        }

        return new CouponValidateResponseDto
        {
            IsValid = true,
            Message = "Coupon applied.",
            Coupon = CouponHelper.MapCoupon(coupon),
            Discount = validation.Discount,
            NewTotal = Math.Max(0, baseSubtotal - validation.Discount)
        };
    }

    private static (bool IsValid, string? Message, decimal Discount) ValidateCoupon(
        Models.Coupon coupon,
        decimal subtotal,
        DateTime now)
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
