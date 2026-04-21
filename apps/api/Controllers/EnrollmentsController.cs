using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/enrollments")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public EnrollmentsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<EnrollmentDto>>> MyEnrollments()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var enrolls = await _db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EnrollmentDto
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course != null ? e.Course.Title : string.Empty,
                CourseSlug = e.Course != null ? e.Course.Slug : string.Empty,
                ThumbnailUrl = e.Course != null ? e.Course.ThumbnailUrl : string.Empty,
                CreatedAt = e.CreatedAt,
                LastLessonId = e.LastLessonId,
                TotalLessons = e.Course != null ? e.Course.Lessons.Count : 0,
                CompletedLessons = e.LessonProgresses.Count,
                ProgressPercent = e.Course != null && e.Course.Lessons.Count > 0
                    ? Math.Round(e.LessonProgresses.Count * 100d / e.Course.Lessons.Count, 1)
                    : 0
            })
            .ToListAsync();

        return Ok(enrolls);
    }

    [HttpPost]
    public async Task<IActionResult> Enroll(EnrollRequest request)
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

        var exists = await _db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == request.CourseId);
        if (exists)
        {
            return Conflict("Already enrolled.");
        }

        _db.Enrollments.Add(new Enrollment
        {
            UserId = userId,
            CourseId = request.CourseId,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok();
    }
}
