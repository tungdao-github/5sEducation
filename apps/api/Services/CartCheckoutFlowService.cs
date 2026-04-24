using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;
using UdemyClone.Api.Common;

namespace UdemyClone.Api.Services;

public class CartCheckoutFlowService
{
    private readonly ICartRepository _repository;
    private readonly CartCheckoutNotificationService _notifications;

    public CartCheckoutFlowService(ICartRepository repository, CartCheckoutNotificationService notifications)
    {
        _repository = repository;
        _notifications = notifications;
    }

    public async Task<CartCheckoutResult> CheckoutAsync(
        string userId,
        CartCheckoutRequest? request,
        CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetCheckoutItemsAsync(userId, cancellationToken);

        if (items.Count == 0)
        {
            return CartCheckoutResult.Fail("Cart is empty.");
        }

        var now = DateTime.UtcNow;
        var unavailable = items.FirstOrDefault(i => !i.CourseIsPublished);
        if (unavailable is not null)
        {
            return CartCheckoutResult.Fail("Some courses are no longer available.");
        }

        var existingCourseIds = await _repository.GetEnrollmentCourseIdsAsync(userId, cancellationToken);
        var existingSet = existingCourseIds.Count == 0 ? new HashSet<int>() : new HashSet<int>(existingCourseIds);

        var orderItems = items.Select(item =>
        {
            var unitPrice = CoursePriceHelper.GetEffectivePrice(item.CoursePrice, item.CourseFlashSalePrice, item.CourseFlashSaleStartsAt, item.CourseFlashSaleEndsAt, now);
            var quantity = Math.Max(1, item.Quantity);
            return new OrderItem
            {
                CourseId = item.CourseId,
                CourseTitle = item.CourseTitle,
                CourseSlug = item.CourseSlug,
                UnitPrice = unitPrice,
                Quantity = quantity,
                LineTotal = unitPrice * quantity
            };
        }).ToList();

        var subtotal = orderItems.Sum(i => i.LineTotal);

        Coupon? coupon = null;
        var discountTotal = 0m;
        var couponCode = request?.CouponCode;
        if (!string.IsNullOrWhiteSpace(couponCode))
        {
            couponCode = couponCode.Trim().ToUpperInvariant();
            coupon = await _repository.FindCouponByCodeAsync(couponCode, cancellationToken);
            if (coupon is null)
            {
                return CartCheckoutResult.Fail("Invalid coupon code.");
            }

            var validation = CartCheckoutHelper.ValidateCoupon(coupon, subtotal, now);
            if (!validation.IsValid)
            {
                return CartCheckoutResult.Fail(validation.Message ?? "Coupon is not valid.");
            }

            discountTotal = validation.Discount;
        }

        var order = new Order
        {
            UserId = userId,
            Status = "paid",
            Subtotal = subtotal,
            DiscountTotal = discountTotal,
            Total = Math.Max(0, subtotal - discountTotal),
            Currency = "USD",
            CouponCode = coupon?.Code,
            CreatedAt = now,
            UpdatedAt = now,
            Items = orderItems
        };

        await using var transaction = await _repository.BeginTransactionAsync(cancellationToken);
        await _repository.AddOrderAsync(order, cancellationToken);

        foreach (var item in items)
        {
            if (!existingSet.Contains(item.CourseId))
            {
                await _repository.AddEnrollmentAsync(new Enrollment
                {
                    UserId = userId,
                    CourseId = item.CourseId,
                    CreatedAt = now
                }, cancellationToken);
            }
        }

        await _repository.RemoveCartItemsByIdAsync(items.Select(item => item.Id), cancellationToken);
        if (coupon is not null)
        {
            coupon.UsedCount += 1;
            coupon.UpdatedAt = now;
        }

        var loyaltyUser = await _repository.FindUserAsync(userId, cancellationToken);
        if (loyaltyUser != null)
        {
            var pointsEarned = CartCheckoutHelper.CalculateLoyaltyPoints(order.Total);
            loyaltyUser.LoyaltyPoints += pointsEarned;
            loyaltyUser.LoyaltyTier = CartCheckoutHelper.ResolveLoyaltyTier(loyaltyUser.LoyaltyPoints);
            loyaltyUser.LoyaltyUpdatedAt = now;
        }

        await _repository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await _notifications.SendOrderConfirmationAsync(
            userId,
            order.Id,
            order.Total,
            order.Currency,
            items.Select(item => item.CourseTitle),
            now,
            cancellationToken);

        return CartCheckoutResult.Ok(CartCheckoutHelper.MapOrder(order));
    }
}
