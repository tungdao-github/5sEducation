using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public OrdersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<OrderDto>>> MyOrders()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var results = await _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                Status = o.Status,
                Subtotal = o.Subtotal,
                DiscountTotal = o.DiscountTotal,
                Total = o.Total,
                Currency = o.Currency,
                CouponCode = o.CouponCode,
                CreatedAt = o.CreatedAt,
                Items = o.Items
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
            })
            .ToListAsync();

        return Ok(results);
    }
}
