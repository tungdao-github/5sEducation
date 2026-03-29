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
            .Include(e => e.Course)
                .ThenInclude(c => c!.Lessons)
            .Include(e => e.LessonProgresses)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        var results = enrolls.Select(e =>
        {
            var totalLessons = e.Course?.Lessons.Count ?? 0;
            var completedLessons = e.LessonProgresses.Count;
            var progressPercent = totalLessons == 0
                ? 0
                : Math.Round(completedLessons * 100d / totalLessons, 1);

            return new EnrollmentDto
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course?.Title ?? string.Empty,
                CourseSlug = e.Course?.Slug ?? string.Empty,
                ThumbnailUrl = e.Course?.ThumbnailUrl ?? string.Empty,
                CreatedAt = e.CreatedAt,
                LastLessonId = e.LastLessonId,
                TotalLessons = totalLessons,
                CompletedLessons = completedLessons,
                ProgressPercent = progressPercent
            };
        }).ToList();

        return Ok(results);
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
