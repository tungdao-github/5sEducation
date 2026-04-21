using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailSender _emailSender;

    public CartController(ApplicationDbContext db, IEmailSender emailSender)
    {
        _db = db;
        _emailSender = emailSender;
    }

    [HttpGet]
    public async Task<ActionResult<List<CartItemDto>>> GetCart()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var items = await _db.CartItems
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Select(c => new CartItemDto
            {
                Id = c.Id,
                CourseId = c.CourseId,
                CourseTitle = c.Course != null ? c.Course.Title : string.Empty,
                CourseSlug = c.Course != null ? c.Course.Slug : string.Empty,
                ThumbnailUrl = c.Course != null ? c.Course.ThumbnailUrl : string.Empty,
                Price = c.Course != null ? GetEffectivePrice(c.Course, DateTime.UtcNow) : 0,
                Quantity = c.Quantity
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Add(CartAddRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var course = await _db.Courses.FindAsync(request.CourseId);
        if (course is null)
        {
            return NotFound();
        }

        if (!course.IsPublished)
        {
            return NotFound();
        }

        var existing = await _db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.CourseId == request.CourseId);
        if (existing is null)
        {
            _db.CartItems.Add(new CartItem
            {
                UserId = userId,
                CourseId = request.CourseId,
                Quantity = request.Quantity
            });
        }
        else
        {
            existing.Quantity = request.Quantity;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{courseId:int}")]
    public async Task<IActionResult> Remove(int courseId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var item = await _db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.CourseId == courseId);
        if (item is null)
        {
            return NotFound();
        }

        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<OrderDto>> Checkout([FromBody] CartCheckoutRequest? request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var items = await _db.CartItems
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Select(c => new
            {
                c.Id,
                c.CourseId,
                CourseTitle = c.Course != null ? c.Course.Title : string.Empty,
                CourseSlug = c.Course != null ? c.Course.Slug : string.Empty,
                CoursePrice = c.Course != null ? c.Course.Price : 0m,
                CourseFlashSalePrice = c.Course != null ? c.Course.FlashSalePrice : null,
                CourseFlashSaleStartsAt = c.Course != null ? c.Course.FlashSaleStartsAt : null,
                CourseFlashSaleEndsAt = c.Course != null ? c.Course.FlashSaleEndsAt : null,
                CourseIsPublished = c.Course != null && c.Course.IsPublished,
                c.Quantity
            })
            .ToListAsync();

        if (items.Count == 0)
        {
            return BadRequest("Cart is empty.");
        }

        var now = DateTime.UtcNow;
        var unavailable = items.FirstOrDefault(i => !i.CourseIsPublished);
        if (unavailable is not null)
        {
            return BadRequest("Some courses are no longer available.");
        }

        var existingCourseIds = await _db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .Select(e => e.CourseId)
            .ToListAsync();
        var existingSet = existingCourseIds.Count == 0 ? new HashSet<int>() : new HashSet<int>(existingCourseIds);

        var orderItems = items.Select(item =>
        {
            var course = new Course
            {
                Price = item.CoursePrice,
                FlashSalePrice = item.CourseFlashSalePrice,
                FlashSaleStartsAt = item.CourseFlashSaleStartsAt,
                FlashSaleEndsAt = item.CourseFlashSaleEndsAt
            };
            var unitPrice = GetEffectivePrice(course, now);
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
            coupon = await _db.Coupons.FirstOrDefaultAsync(c => c.Code == couponCode);
            if (coupon is null)
            {
                return BadRequest("Invalid coupon code.");
            }

            var validation = ValidateCoupon(coupon, subtotal, now);
            if (!validation.IsValid)
            {
                return BadRequest(validation.Message ?? "Coupon is not valid.");
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

        await using var transaction = await _db.Database.BeginTransactionAsync();
        _db.Orders.Add(order);

        foreach (var item in items)
        {
            if (!existingSet.Contains(item.CourseId))
            {
                _db.Enrollments.Add(new Enrollment
                {
                    UserId = userId,
                    CourseId = item.CourseId,
                    CreatedAt = now
                });
            }
        }

        _db.CartItems.RemoveRange(items.Select(item => new CartItem { Id = item.Id }));
        if (coupon is not null)
        {
            coupon.UsedCount += 1;
            coupon.UpdatedAt = now;
        }
        var loyaltyUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (loyaltyUser != null)
        {
            var pointsEarned = CalculateLoyaltyPoints(order.Total);
            loyaltyUser.LoyaltyPoints += pointsEarned;
            loyaltyUser.LoyaltyTier = ResolveLoyaltyTier(loyaltyUser.LoyaltyPoints);
            loyaltyUser.LoyaltyUpdatedAt = now;
        }

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        try
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                var courseLines = items
                    .Select(item => item.CourseTitle)
                    .Where(title => !string.IsNullOrWhiteSpace(title))
                    .Select(title => $"- {title}")
                    .ToList();

                var body = $"Thanks for your order (#{order.Id}). Your courses are now available.\n\n"
                           + (courseLines.Count > 0 ? $"Courses:\n{string.Join("\n", courseLines)}\n\n" : "")
                           + $"Order total: {order.Total:0.00} {order.Currency}\n"
                           + $"Order date: {now:yyyy-MM-dd HH:mm} UTC\n"
                           + "You can access them from My Learning.";

                await _emailSender.SendAsync(user.Email, "Enrollment confirmed", body);
            }
        }
        catch
        {
            // ignore email errors to avoid blocking checkout
        }

        return Ok(MapOrder(order));
    }

    private static int CalculateLoyaltyPoints(decimal total)
    {
        if (total <= 0)
        {
            return 0;
        }

        return (int)Math.Round(total, MidpointRounding.AwayFromZero);
    }

    private static string ResolveLoyaltyTier(int points)
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

    private static OrderDto MapOrder(Order order)
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

    private static bool IsFlashSaleActive(Course course, DateTime now)
    {
        if (!course.FlashSalePrice.HasValue || course.FlashSalePrice.Value <= 0)
        {
            return false;
        }

        if (course.FlashSalePrice.Value >= course.Price)
        {
            return false;
        }

        if (course.FlashSaleStartsAt.HasValue && now < course.FlashSaleStartsAt.Value)
        {
            return false;
        }

        if (course.FlashSaleEndsAt.HasValue && now > course.FlashSaleEndsAt.Value)
        {
            return false;
        }

        return true;
    }

    private static decimal GetEffectivePrice(Course course, DateTime now)
    {
        return IsFlashSaleActive(course, now)
            ? course.FlashSalePrice ?? course.Price
            : course.Price;
    }
}
