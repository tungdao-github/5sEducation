using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/history")]
[Authorize]
public class HistoryController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public HistoryController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPost("views")]
    public async Task<IActionResult> RecordView([FromBody] CourseViewCreateRequest request)
    {
        if (request.CourseId <= 0)
        {
            return BadRequest("CourseId is required.");
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var course = await _db.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CourseId);
        if (course is null)
        {
            return NotFound();
        }

        var isAdmin = User.IsInRole("Admin");
        var isInstructor = course.InstructorId == userId;
        if (!course.IsPublished && !isAdmin && !isInstructor)
        {
            return NotFound();
        }

        var existing = await _db.CourseViewHistories
            .FirstOrDefaultAsync(v => v.UserId == userId && v.CourseId == request.CourseId);

        if (existing is null)
        {
            _db.CourseViewHistories.Add(new CourseViewHistory
            {
                UserId = userId,
                CourseId = request.CourseId,
                ViewedAt = DateTime.UtcNow
            });
        }
        else
        {
            existing.ViewedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("views")]
    public async Task<ActionResult<List<CourseHistoryDto>>> GetViews([FromQuery] int? limit)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var take = Math.Clamp(limit ?? 8, 1, 50);

        var items = await _db.CourseViewHistories
            .AsNoTracking()
            .Where(v => v.UserId == userId)
            .Include(v => v.Course!)
            .ThenInclude(c => c.Category)
            .Include(v => v.Course!)
            .ThenInclude(c => c.Reviews)
            .Include(v => v.Course!)
            .ThenInclude(c => c.Enrollments)
            .OrderByDescending(v => v.ViewedAt)
            .Take(take)
            .Select(v => new CourseHistoryDto
            {
                Id = v.CourseId,
                Title = v.Course != null ? v.Course.Title : string.Empty,
                Slug = v.Course != null ? v.Course.Slug : string.Empty,
                ShortDescription = v.Course != null ? v.Course.ShortDescription : string.Empty,
                Price = v.Course != null ? v.Course.Price : 0,
                ThumbnailUrl = v.Course != null ? v.Course.ThumbnailUrl : string.Empty,
                Language = v.Course != null ? v.Course.Language : string.Empty,
                Level = v.Course != null ? v.Course.Level : string.Empty,
                AverageRating = v.Course != null
                    ? v.Course.Reviews.Select(r => (double?)r.Rating).Average() ?? 0
                    : 0,
                ReviewCount = v.Course != null ? v.Course.Reviews.Count : 0,
                StudentCount = v.Course != null ? v.Course.Enrollments.Count : 0,
                Category = v.Course != null && v.Course.Category != null
                    ? new CategoryDto
                    {
                        Id = v.Course.Category.Id,
                        Title = v.Course.Category.Title,
                        Slug = v.Course.Category.Slug
                    }
                    : null,
                ViewedAt = v.ViewedAt
            })
            .ToListAsync();

        return Ok(items);
    }
}
