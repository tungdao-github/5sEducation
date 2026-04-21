using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/coupons")]
[Authorize(Roles = "Admin")]
public class AdminCouponsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminCouponsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<CouponDto>>> GetAll([FromQuery] string? search)
    {
        var query = _db.Coupons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = $"%{search.Trim()}%";
            query = query.Where(c =>
                EF.Functions.Like(c.Code, q)
                || (c.Description != null && EF.Functions.Like(c.Description, q)));
        }

        var coupons = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CouponDto
            {
                Id = c.Id,
                Code = c.Code,
                Type = c.Type,
                Value = c.Value,
                MinOrder = c.MinOrder,
                MaxUses = c.MaxUses,
                UsedCount = c.UsedCount,
                ExpiresAt = c.ExpiresAt,
                IsActive = c.IsActive,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();

        return Ok(coupons);
    }

    [HttpPost]
    public async Task<ActionResult<CouponDto>> Create([FromBody] CouponCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest("Code is required.");
        }

        var code = request.Code.Trim().ToUpperInvariant();
        var exists = await _db.Coupons.AnyAsync(c => c.Code == code);
        if (exists)
        {
            return Conflict("Coupon code already exists.");
        }

        var now = DateTime.UtcNow;
        var coupon = new Coupon
        {
            Code = code,
            Description = request.Description?.Trim(),
            Type = NormalizeType(request.Type),
            Value = Math.Max(0, request.Value),
            MinOrder = Math.Max(0, request.MinOrder),
            MaxUses = Math.Max(0, request.MaxUses),
            ExpiresAt = request.ExpiresAt,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Coupons.Add(coupon);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = coupon.Id }, MapCoupon(coupon));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CouponUpdateRequest request)
    {
        var coupon = await _db.Coupons.FindAsync(id);
        if (coupon is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var normalized = request.Code.Trim().ToUpperInvariant();
            var exists = await _db.Coupons.AnyAsync(c => c.Code == normalized && c.Id != id);
            if (exists)
            {
                return Conflict("Coupon code already exists.");
            }

            coupon.Code = normalized;
        }

        coupon.Description = request.Description?.Trim();
        coupon.Type = NormalizeType(request.Type);
        coupon.Value = Math.Max(0, request.Value);
        coupon.MinOrder = Math.Max(0, request.MinOrder);
        coupon.MaxUses = Math.Max(0, request.MaxUses);
        coupon.ExpiresAt = request.ExpiresAt;
        coupon.IsActive = request.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var coupon = await _db.Coupons.FindAsync(id);
        if (coupon is null)
        {
            return NotFound();
        }

        _db.Coupons.Remove(coupon);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static string NormalizeType(string? input)
    {
        var normalized = (input ?? string.Empty).Trim().ToLowerInvariant();
        return normalized == "percent" ? "percent" : "fixed";
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
}
