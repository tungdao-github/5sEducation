using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/learning-paths")]
[Authorize(Roles = "Admin")]
public class AdminLearningPathsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminLearningPathsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<LearningPathListDto>>> GetAll()
    {
        var paths = await _db.LearningPaths
            .AsNoTracking()
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
                CourseCount = p.Courses.Count,
                IsPublished = p.IsPublished
            })
            .ToListAsync();

        return Ok(paths);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LearningPathDetailDto>> GetById(int id)
    {
        var path = await _db.LearningPaths
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.Sections)
            .Include(p => p.Courses)
            .ThenInclude(pc => pc.Course)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (path is null)
        {
            return NotFound();
        }

        var sections = path.Sections
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

        var courses = path.Courses
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
            CourseCount = courses.Count,
            Sections = sections,
            Courses = courses
        });
    }

    [HttpPost]
    public async Task<ActionResult<LearningPathListDto>> Create(LearningPathCreateRequest request)
    {
        var slug = SlugHelper.Slugify(request.Title);
        var exists = await _db.LearningPaths.AnyAsync(p => p.Slug == slug);
        if (exists)
        {
            return Conflict("Learning path already exists.");
        }

        var now = DateTime.UtcNow;
        var path = new LearningPath
        {
            Title = request.Title,
            Slug = slug,
            Description = request.Description,
            Level = request.Level,
            ThumbnailUrl = request.ThumbnailUrl,
            EstimatedHours = request.EstimatedHours,
            IsPublished = request.IsPublished,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.LearningPaths.Add(path);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = path.Id }, new LearningPathListDto
        {
            Id = path.Id,
            Title = path.Title,
            Slug = path.Slug,
            Description = path.Description,
            Level = path.Level,
            ThumbnailUrl = path.ThumbnailUrl,
            EstimatedHours = path.EstimatedHours,
            CourseCount = 0,
            IsPublished = path.IsPublished
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, LearningPathUpdateRequest request)
    {
        var path = await _db.LearningPaths.FindAsync(id);
        if (path is null)
        {
            return NotFound();
        }

        var slug = SlugHelper.Slugify(request.Title);
        var slugExists = await _db.LearningPaths.AnyAsync(p => p.Slug == slug && p.Id != id);
        if (slugExists)
        {
            return Conflict("Learning path slug already exists.");
        }

        path.Title = request.Title;
        path.Slug = slug;
        path.Description = request.Description;
        path.Level = request.Level;
        path.ThumbnailUrl = request.ThumbnailUrl;
        path.EstimatedHours = request.EstimatedHours;
        path.IsPublished = request.IsPublished;
        path.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var hasPath = await _db.LearningPaths
            .AsNoTracking()
            .AnyAsync(p => p.Id == id);
        if (!hasPath)
        {
            return NotFound();
        }

        var courseLinkIds = await _db.LearningPathCourses
            .AsNoTracking()
            .Where(pc => pc.LearningPathId == id)
            .Select(pc => pc.Id)
            .ToListAsync();

        var sectionIds = await _db.LearningPathSections
            .AsNoTracking()
            .Where(ps => ps.LearningPathId == id)
            .Select(ps => ps.Id)
            .ToListAsync();

        if (courseLinkIds.Count > 0)
        {
            _db.LearningPathCourses.RemoveRange(courseLinkIds.Select(courseLinkId => new LearningPathCourse { Id = courseLinkId }));
        }

        if (sectionIds.Count > 0)
        {
            _db.LearningPathSections.RemoveRange(sectionIds.Select(sectionId => new LearningPathSection { Id = sectionId }));
        }

        _db.LearningPaths.Remove(new LearningPath { Id = id });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/sections")]
    public async Task<ActionResult<LearningPathSectionDto>> CreateSection(int id, LearningPathSectionRequest request)
    {
        var path = await _db.LearningPaths.FindAsync(id);
        if (path is null)
        {
            return NotFound();
        }

        var section = new LearningPathSection
        {
            LearningPathId = id,
            Title = request.Title,
            Description = request.Description,
            SortOrder = request.SortOrder
        };

        _db.LearningPathSections.Add(section);
        await _db.SaveChangesAsync();

        await TouchPathAsync(id);

        return CreatedAtAction(nameof(GetById), new { id }, new LearningPathSectionDto
        {
            Id = section.Id,
            LearningPathId = section.LearningPathId,
            Title = section.Title,
            Description = section.Description,
            SortOrder = section.SortOrder
        });
    }

    [HttpPut("sections/{sectionId:int}")]
    public async Task<IActionResult> UpdateSection(int sectionId, LearningPathSectionRequest request)
    {
        var section = await _db.LearningPathSections.FindAsync(sectionId);
        if (section is null)
        {
            return NotFound();
        }

        section.Title = request.Title;
        section.Description = request.Description;
        section.SortOrder = request.SortOrder;

        await _db.SaveChangesAsync();
        await TouchPathAsync(section.LearningPathId);
        return NoContent();
    }

    [HttpDelete("sections/{sectionId:int}")]
    public async Task<IActionResult> DeleteSection(int sectionId)
    {
        var section = await _db.LearningPathSections.FindAsync(sectionId);
        if (section is null)
        {
            return NotFound();
        }

        _db.LearningPathSections.Remove(section);
        await _db.SaveChangesAsync();
        await TouchPathAsync(section.LearningPathId);
        return NoContent();
    }

    [HttpPost("{id:int}/courses")]
    public async Task<ActionResult<LearningPathCourseDto>> AddCourse(int id, LearningPathCourseRequest request)
    {
        var path = await _db.LearningPaths.FindAsync(id);
        if (path is null)
        {
            return NotFound();
        }

        var course = await _db.Courses.FindAsync(request.CourseId);
        if (course is null)
        {
            return NotFound("Course not found.");
        }

        var item = new LearningPathCourse
        {
            LearningPathId = id,
            LearningPathSectionId = request.LearningPathSectionId,
            CourseId = request.CourseId,
            SortOrder = request.SortOrder,
            IsRequired = request.IsRequired
        };

        _db.LearningPathCourses.Add(item);
        await _db.SaveChangesAsync();

        await TouchPathAsync(id);

        return CreatedAtAction(nameof(GetById), new { id }, new LearningPathCourseDto
        {
            Id = item.Id,
            LearningPathId = item.LearningPathId,
            LearningPathSectionId = item.LearningPathSectionId,
            CourseId = item.CourseId,
            CourseTitle = course.Title,
            CourseSlug = course.Slug,
            CourseThumbnailUrl = course.ThumbnailUrl,
            CourseLevel = course.Level,
            CourseLanguage = course.Language,
            SortOrder = item.SortOrder,
            IsRequired = item.IsRequired
        });
    }

    [HttpPut("courses/{pathCourseId:int}")]
    public async Task<IActionResult> UpdateCourse(int pathCourseId, LearningPathCourseRequest request)
    {
        var item = await _db.LearningPathCourses.FindAsync(pathCourseId);
        if (item is null)
        {
            return NotFound();
        }

        item.CourseId = request.CourseId;
        item.LearningPathSectionId = request.LearningPathSectionId;
        item.SortOrder = request.SortOrder;
        item.IsRequired = request.IsRequired;

        await _db.SaveChangesAsync();
        await TouchPathAsync(item.LearningPathId);
        return NoContent();
    }

    [HttpDelete("courses/{pathCourseId:int}")]
    public async Task<IActionResult> DeleteCourse(int pathCourseId)
    {
        var item = await _db.LearningPathCourses.FindAsync(pathCourseId);
        if (item is null)
        {
            return NotFound();
        }

        _db.LearningPathCourses.Remove(item);
        await _db.SaveChangesAsync();
        await TouchPathAsync(item.LearningPathId);
        return NoContent();
    }

    private async Task TouchPathAsync(int learningPathId)
    {
        var path = await _db.LearningPaths.FindAsync(learningPathId);
        if (path is null)
        {
            return;
        }

        path.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }
}
