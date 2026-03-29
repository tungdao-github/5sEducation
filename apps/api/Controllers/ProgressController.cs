using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ProgressController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("{courseId:int}")]
    public async Task<ActionResult<ProgressSnapshotDto>> GetProgress(int courseId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var enrollment = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c!.Lessons)
            .Include(e => e.LessonProgresses)
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

        if (enrollment is null)
        {
            return Forbid();
        }

        return Ok(BuildSnapshot(enrollment));
    }

    [HttpPost]
    public async Task<ActionResult<ProgressSnapshotDto>> UpdateProgress([FromBody] ProgressUpdateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var enrollment = await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c!.Lessons)
            .Include(e => e.LessonProgresses)
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == request.CourseId);

        if (enrollment is null)
        {
            return Forbid();
        }

        if (enrollment.Course is null || !enrollment.Course.Lessons.Any(l => l.Id == request.LessonId))
        {
            return BadRequest("Lesson does not belong to this course.");
        }

        if (request.SetAsLast)
        {
            enrollment.LastLessonId = request.LessonId;
            enrollment.UpdatedAt = DateTime.UtcNow;
        }

        if (request.IsCompleted.HasValue)
        {
            var existing = enrollment.LessonProgresses.FirstOrDefault(lp => lp.LessonId == request.LessonId);
            if (request.IsCompleted.Value)
            {
                if (existing is null)
                {
                    var progress = new LessonProgress
                    {
                        EnrollmentId = enrollment.Id,
                        LessonId = request.LessonId,
                        CompletedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    enrollment.LessonProgresses.Add(progress);
                }
                else
                {
                    existing.CompletedAt = DateTime.UtcNow;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
            }
            else if (existing is not null)
            {
                enrollment.LessonProgresses.Remove(existing);
                _db.LessonProgresses.Remove(existing);
            }
        }

        await _db.SaveChangesAsync();
        return Ok(BuildSnapshot(enrollment));
    }

    private static ProgressSnapshotDto BuildSnapshot(Enrollment enrollment)
    {
        var totalLessons = enrollment.Course?.Lessons.Count ?? 0;
        var completedLessonIds = enrollment.LessonProgresses
            .Select(lp => lp.LessonId)
            .Distinct()
            .ToList();
        var completedLessons = completedLessonIds.Count;
        var progressPercent = totalLessons == 0
            ? 0
            : Math.Round(completedLessons * 100d / totalLessons, 1);

        return new ProgressSnapshotDto
        {
            CourseId = enrollment.CourseId,
            LastLessonId = enrollment.LastLessonId,
            TotalLessons = totalLessons,
            CompletedLessons = completedLessons,
            ProgressPercent = progressPercent,
            CompletedLessonIds = completedLessonIds
        };
    }
}
