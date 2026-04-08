using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminOrdersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderAdminDto>>> GetAll([FromQuery] string? status)
    {
        var query = _db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status == status);
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var results = orders.Select(o => new OrderAdminDto
        {
            Id = o.Id,
            Status = o.Status,
            Subtotal = o.Subtotal,
            DiscountTotal = o.DiscountTotal,
            Total = o.Total,
            Currency = o.Currency,
            CouponCode = o.CouponCode,
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt,
            UserId = o.UserId,
            UserEmail = o.User?.Email ?? string.Empty,
            UserName = $"{o.User?.FirstName} {o.User?.LastName}".Trim(),
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
        }).ToList();

        return Ok(results);
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, OrderStatusUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest("Status is required.");
        }

        var order = await _db.Orders.FindAsync(id);
        if (order is null)
        {
            return NotFound();
        }

        order.Status = request.Status.Trim();
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
