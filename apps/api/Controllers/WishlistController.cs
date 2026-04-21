using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public WishlistController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<WishlistItemDto>>> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var items = await _db.WishlistItems
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WishlistItemDto
            {
                Id = w.Id,
                CourseId = w.CourseId,
                CourseTitle = w.Course != null ? w.Course.Title : string.Empty,
                CourseSlug = w.Course != null ? w.Course.Slug : string.Empty,
                ThumbnailUrl = w.Course != null ? w.Course.ThumbnailUrl : string.Empty,
                Price = w.Course != null ? w.Course.Price : 0,
                Level = w.Course != null ? w.Course.Level : string.Empty,
                Language = w.Course != null ? w.Course.Language : string.Empty
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Add(WishlistAddRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var course = await _db.Courses.FindAsync(request.CourseId);
        if (course is null)
        {
            return NotFound();
        }

        var exists = await _db.WishlistItems.AnyAsync(w => w.UserId == userId && w.CourseId == request.CourseId);
        if (exists)
        {
            return Ok();
        }

        _db.WishlistItems.Add(new WishlistItem
        {
            UserId = userId,
            CourseId = request.CourseId,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{courseId:int}")]
    public async Task<IActionResult> Remove(int courseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var item = await _db.WishlistItems.FirstOrDefaultAsync(w => w.UserId == userId && w.CourseId == courseId);
        if (item is null)
        {
            return NotFound();
        }

        _db.WishlistItems.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
