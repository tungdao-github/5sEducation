using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ReviewsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReviewDto>>> GetByCourse([FromQuery] int courseId)
    {
        var reviews = await _db.Reviews
            .Include(r => r.User)
            .Where(r => r.CourseId == courseId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UserName = r.User == null
                    ? "Learner"
                    : string.IsNullOrWhiteSpace(r.User.FirstName)
                        ? r.User.Email ?? "Learner"
                        : $"{r.User.FirstName} {r.User.LastName}".Trim()
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Upsert(ReviewCreateRequest request)
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

        var enrolled = await _db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == request.CourseId);
        if (!enrolled)
        {
            return BadRequest("Enroll in the course before leaving a review.");
        }

        var existing = await _db.Reviews.FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == request.CourseId);
        if (existing is null)
        {
            _db.Reviews.Add(new Review
            {
                UserId = userId,
                CourseId = request.CourseId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            existing.Rating = request.Rating;
            existing.Comment = request.Comment;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    [Authorize]
    [HttpDelete("{courseId:int}")]
    public async Task<IActionResult> Delete(int courseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.CourseId == courseId && r.UserId == userId);
        if (review is null)
        {
            return NotFound();
        }

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
