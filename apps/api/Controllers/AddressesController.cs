using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AddressesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserAddressDto>>> GetAll()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var addresses = await _db.UserAddresses
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.UpdatedAt)
            .Select(a => new UserAddressDto
            {
                Id = a.Id,
                Label = a.Label,
                RecipientName = a.RecipientName,
                Phone = a.Phone,
                Line1 = a.Line1,
                Line2 = a.Line2,
                City = a.City,
                State = a.State,
                PostalCode = a.PostalCode,
                Country = a.Country,
                IsDefault = a.IsDefault,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            })
            .ToListAsync();

        return Ok(addresses);
    }

    [HttpPost]
    public async Task<ActionResult<UserAddressDto>> Create(UserAddressCreateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var now = DateTime.UtcNow;
        var address = new UserAddress
        {
            UserId = userId,
            Label = request.Label?.Trim() ?? string.Empty,
            RecipientName = request.RecipientName.Trim(),
            Phone = request.Phone.Trim(),
            Line1 = request.Line1.Trim(),
            Line2 = request.Line2?.Trim(),
            City = request.City.Trim(),
            State = request.State?.Trim() ?? string.Empty,
            PostalCode = request.PostalCode?.Trim() ?? string.Empty,
            Country = request.Country?.Trim() ?? "Vietnam",
            IsDefault = request.IsDefault,
            CreatedAt = now,
            UpdatedAt = now
        };

        if (!await _db.UserAddresses.AnyAsync(a => a.UserId == userId))
        {
            address.IsDefault = true;
        }

        _db.UserAddresses.Add(address);
        await _db.SaveChangesAsync();

        if (address.IsDefault)
        {
            await ClearOtherDefaultsAsync(userId, address.Id);
        }

        return CreatedAtAction(nameof(GetAll), new { id = address.Id }, MapAddress(address));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UserAddressUpdateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var address = await _db.UserAddresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address is null)
        {
            return NotFound();
        }

        address.Label = request.Label?.Trim() ?? string.Empty;
        address.RecipientName = request.RecipientName.Trim();
        address.Phone = request.Phone.Trim();
        address.Line1 = request.Line1.Trim();
        address.Line2 = request.Line2?.Trim();
        address.City = request.City.Trim();
        address.State = request.State?.Trim() ?? string.Empty;
        address.PostalCode = request.PostalCode?.Trim() ?? string.Empty;
        address.Country = request.Country?.Trim() ?? "Vietnam";
        address.IsDefault = request.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        if (address.IsDefault)
        {
            await ClearOtherDefaultsAsync(userId, address.Id);
        }
        else if (!await _db.UserAddresses.AnyAsync(a => a.UserId == userId && a.IsDefault))
        {
            address.IsDefault = true;
            address.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var address = await _db.UserAddresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address is null)
        {
            return NotFound();
        }

        var wasDefault = address.IsDefault;
        _db.UserAddresses.Remove(address);
        await _db.SaveChangesAsync();

        if (wasDefault)
        {
            var next = await _db.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.UpdatedAt)
                .FirstOrDefaultAsync();

            if (next is not null)
            {
                next.IsDefault = true;
                next.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        return NoContent();
    }

    private async Task ClearOtherDefaultsAsync(string userId, int keepId)
    {
        var others = await _db.UserAddresses
            .Where(a => a.UserId == userId && a.Id != keepId && a.IsDefault)
            .ToListAsync();

        if (others.Count == 0)
        {
            return;
        }

        foreach (var item in others)
        {
            item.IsDefault = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }

    private static UserAddressDto MapAddress(UserAddress address) =>
        new UserAddressDto
        {
            Id = address.Id,
            Label = address.Label,
            RecipientName = address.RecipientName,
            Phone = address.Phone,
            Line1 = address.Line1,
            Line2 = address.Line2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country,
            IsDefault = address.IsDefault,
            CreatedAt = address.CreatedAt,
            UpdatedAt = address.UpdatedAt
        };
}
