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

        var snapshot = await _db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId && e.CourseId == courseId)
            .Select(e => new
            {
                e.Id,
                e.CourseId,
                e.LastLessonId
            })
            .FirstOrDefaultAsync();

        if (snapshot is null)
        {
            return Forbid();
        }

        var completedLessonIds = await _db.LessonProgresses
            .AsNoTracking()
            .Where(lp => lp.EnrollmentId == snapshot.Id)
            .Select(lp => lp.LessonId)
            .Distinct()
            .ToListAsync();

        var totalLessons = await _db.Lessons
            .AsNoTracking()
            .CountAsync(l => l.CourseId == snapshot.CourseId);

        return Ok(BuildSnapshot(snapshot.CourseId, snapshot.LastLessonId, totalLessons, completedLessonIds));
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
            .Include(e => e.LessonProgresses)
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == request.CourseId);

        if (enrollment is null)
        {
            return Forbid();
        }

        var lessonBelongsToCourse = await _db.Lessons
            .AsNoTracking()
            .AnyAsync(l => l.Id == request.LessonId && l.CourseId == request.CourseId);

        if (!lessonBelongsToCourse)
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
        return Ok(await BuildSnapshotAsync(enrollment.Id));
    }

    private async Task<ProgressSnapshotDto> BuildSnapshotAsync(int enrollmentId)
    {
        var snapshot = await _db.Enrollments
            .AsNoTracking()
            .Where(e => e.Id == enrollmentId)
            .Select(e => new
            {
                e.CourseId,
                e.LastLessonId
            })
            .FirstAsync();

        var completedLessonIds = await _db.LessonProgresses
            .AsNoTracking()
            .Where(lp => lp.EnrollmentId == enrollmentId)
            .Select(lp => lp.LessonId)
            .Distinct()
            .ToListAsync();

        var totalLessons = await _db.Lessons
            .AsNoTracking()
            .CountAsync(l => l.CourseId == snapshot.CourseId);

        return BuildSnapshot(
            snapshot.CourseId,
            snapshot.LastLessonId,
            totalLessons,
            completedLessonIds);
    }

    private static ProgressSnapshotDto BuildSnapshot(
        int courseId,
        int? lastLessonId,
        int totalLessons,
        List<int> completedLessonIds)
    {
        var progressPercent = totalLessons == 0
            ? 0
            : Math.Round(completedLessonIds.Count * 100d / totalLessons, 1);

        return new ProgressSnapshotDto
        {
            CourseId = courseId,
            LastLessonId = lastLessonId,
            TotalLessons = totalLessons,
            CompletedLessons = completedLessonIds.Count,
            ProgressPercent = progressPercent,
            CompletedLessonIds = completedLessonIds
        };
    }
}
