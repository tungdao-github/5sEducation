using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/reviews")]
[Authorize(Roles = "Admin")]
public class AdminReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminReviewsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminReviewDto>>> GetAll([FromQuery] int? courseId, [FromQuery] string? query, [FromQuery] int? take)
    {
        var reviews = _db.Reviews
            .AsNoTracking()
            .AsQueryable();

        if (courseId.HasValue && courseId.Value > 0)
        {
            reviews = reviews.Where(r => r.CourseId == courseId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = $"%{query.Trim()}%";
            reviews = reviews.Where(r =>
                (r.Comment != null && EF.Functions.Like(r.Comment, q))
                || (r.User != null && r.User.Email != null && EF.Functions.Like(r.User.Email, q))
                || (r.Course != null && EF.Functions.Like(r.Course.Title, q)));
        }

        var limit = Math.Clamp(take ?? 120, 20, 500);

        var results = await reviews
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new AdminReviewDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                CourseTitle = r.Course != null ? r.Course.Title : string.Empty,
                Rating = r.Rating,
                Comment = r.Comment,
                UserId = r.UserId,
                UserEmail = r.User != null ? (r.User.Email ?? string.Empty) : string.Empty,
                UserName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}".Trim() : string.Empty,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(results);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review is null)
        {
            return NotFound();
        }

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}


