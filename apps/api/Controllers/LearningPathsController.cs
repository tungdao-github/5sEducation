using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/learning-paths")]
public class LearningPathsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public LearningPathsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<LearningPathListDto>>> GetAll()
    {
        var paths = await _db.LearningPaths
            .Where(p => p.IsPublished)
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => new LearningPathListDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Description = p.Description,
                Level = p.Level,
                ThumbnailUrl = p.ThumbnailUrl,
                EstimatedHours = p.EstimatedHours,
                CourseCount = p.Courses.Count(pc => pc.Course != null && pc.Course.IsPublished),
                IsPublished = p.IsPublished
            })
            .ToListAsync();

        return Ok(paths);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<LearningPathDetailDto>> GetBySlug(string slug)
    {
        var path = await _db.LearningPaths
            .Include(p => p.Sections)
            .Include(p => p.Courses)
            .ThenInclude(pc => pc.Course)
            .FirstOrDefaultAsync(p => p.Slug == slug);

        if (path is null || (!path.IsPublished && !User.IsInRole("Admin")))
        {
            return NotFound();
        }

        var orderedSections = path.Sections
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Id)
            .Select(s => new LearningPathSectionDto
            {
                Id = s.Id,
                LearningPathId = s.LearningPathId,
                Title = s.Title,
                Description = s.Description,
                SortOrder = s.SortOrder
            })
            .ToList();

        var orderedCourses = path.Courses
            .Where(c => c.Course != null && c.Course.IsPublished)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Id)
            .Select(c => new LearningPathCourseDto
            {
                Id = c.Id,
                LearningPathId = c.LearningPathId,
                LearningPathSectionId = c.LearningPathSectionId,
                CourseId = c.CourseId,
                CourseTitle = c.Course?.Title ?? string.Empty,
                CourseSlug = c.Course?.Slug ?? string.Empty,
                CourseThumbnailUrl = c.Course?.ThumbnailUrl ?? string.Empty,
                CourseLevel = c.Course?.Level ?? string.Empty,
                CourseLanguage = c.Course?.Language ?? string.Empty,
                SortOrder = c.SortOrder,
                IsRequired = c.IsRequired
            })
            .ToList();

        var enrolledCourseCount = await GetEnrolledCourseCountAsync(path.Id);
        var courseCount = orderedCourses.Count;
        var progressPercent = courseCount > 0 && enrolledCourseCount.HasValue
            ? (int)Math.Round(enrolledCourseCount.Value * 100d / courseCount)
            : (int?)null;

        return Ok(new LearningPathDetailDto
        {
            Id = path.Id,
            Title = path.Title,
            Slug = path.Slug,
            Description = path.Description,
            Level = path.Level,
            ThumbnailUrl = path.ThumbnailUrl,
            EstimatedHours = path.EstimatedHours,
            IsPublished = path.IsPublished,
            CourseCount = courseCount,
            EnrolledCourseCount = enrolledCourseCount,
            ProgressPercent = progressPercent,
            Sections = orderedSections,
            Courses = orderedCourses
        });
    }

    private async Task<int?> GetEnrolledCourseCountAsync(int learningPathId)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return null;
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        var courseIds = await _db.LearningPathCourses
            .Where(pc => pc.LearningPathId == learningPathId)
            .Select(pc => pc.CourseId)
            .ToListAsync();

        if (courseIds.Count == 0)
        {
            return 0;
        }

        return await _db.Enrollments
            .Where(e => e.UserId == userId && courseIds.Contains(e.CourseId))
            .Select(e => e.CourseId)
            .Distinct()
            .CountAsync();
    }
}
