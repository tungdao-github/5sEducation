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
            .Include(c => c.Course)
            .Where(c => c.UserId == userId)
            .Select(c => new CartItemDto
            {
                Id = c.Id,
                CourseId = c.CourseId,
                CourseTitle = c.Course!.Title,
                CourseSlug = c.Course.Slug,
                ThumbnailUrl = c.Course.ThumbnailUrl,
                Price = GetEffectivePrice(c.Course, DateTime.UtcNow),
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
    public async Task<ActionResult<OrderDto>> Checkout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var items = await _db.CartItems
            .Include(c => c.Course)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (items.Count == 0)
        {
            return BadRequest("Cart is empty.");
        }

        var now = DateTime.UtcNow;
        var unavailable = items.FirstOrDefault(i => i.Course is null || !i.Course.IsPublished);
        if (unavailable is not null)
        {
            return BadRequest("Some courses are no longer available.");
        }

        var existingCourseIds = await _db.Enrollments
            .Where(e => e.UserId == userId)
            .Select(e => e.CourseId)
            .ToListAsync();
        var existingSet = existingCourseIds.Count == 0 ? new HashSet<int>() : new HashSet<int>(existingCourseIds);

        var orderItems = items.Select(item =>
        {
            var unitPrice = GetEffectivePrice(item.Course!, now);
            var quantity = Math.Max(1, item.Quantity);
            return new OrderItem
            {
                CourseId = item.CourseId,
                CourseTitle = item.Course?.Title ?? string.Empty,
                CourseSlug = item.Course?.Slug ?? string.Empty,
                UnitPrice = unitPrice,
                Quantity = quantity,
                LineTotal = unitPrice * quantity
            };
        }).ToList();

        var subtotal = orderItems.Sum(i => i.LineTotal);
        var order = new Order
        {
            UserId = userId,
            Status = "paid",
            Subtotal = subtotal,
            DiscountTotal = 0,
            Total = subtotal,
            Currency = "USD",
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

        _db.CartItems.RemoveRange(items);
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
                    .Select(item => item.Course?.Title)
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
