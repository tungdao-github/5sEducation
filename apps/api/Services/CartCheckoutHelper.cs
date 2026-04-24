using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Common;

namespace UdemyClone.Api.Services;

public static class CartCheckoutHelper
{
    public static decimal GetEffectivePrice(
        decimal price,
        decimal? flashSalePrice,
        DateTime? flashSaleStartsAt,
        DateTime? flashSaleEndsAt,
        DateTime now)
    {
        return CoursePriceHelper.GetEffectivePrice(price, flashSalePrice, flashSaleStartsAt, flashSaleEndsAt, now);
    }

    public static (bool IsValid, string? Message, decimal Discount) ValidateCoupon(Coupon coupon, decimal subtotal, DateTime now)
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

    public static int CalculateLoyaltyPoints(decimal total)
    {
        if (total <= 0)
        {
            return 0;
        }

        return (int)Math.Round(total, MidpointRounding.AwayFromZero);
    }

    public static string ResolveLoyaltyTier(int points)
    {
        if (points >= 1000)
        {
            return "Platinum";
        }

        if (points >= 500)
        {
            return "Gold";
        }

        if (points >= 200)
        {
            return "Silver";
        }

        return "Bronze";
    }

    public static OrderDto MapOrder(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            Status = order.Status,
            Subtotal = order.Subtotal,
            DiscountTotal = order.DiscountTotal,
            Total = order.Total,
            Currency = order.Currency,
            CouponCode = order.CouponCode,
            CreatedAt = order.CreatedAt,
            Items = order.Items
                .OrderBy(i => i.Id)
                .Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    CourseId = i.CourseId,
                    CourseTitle = i.CourseTitle,
                    CourseSlug = i.CourseSlug,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    LineTotal = i.LineTotal
                })
                .ToList()
        };
    }
}
