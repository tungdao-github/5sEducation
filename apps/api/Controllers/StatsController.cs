using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/stats")]
public class StatsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public StatsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<PublicStatsDto>> GetSummary()
    {
        var publishedCourses = _db.Courses
            .AsNoTracking()
            .Where(c => c.IsPublished);

        var totalCourses = await publishedCourses.CountAsync();

        var totalStudents = await _db.Enrollments
            .AsNoTracking()
            .Select(e => e.UserId)
            .Distinct()
            .CountAsync();

        var totalInstructors = await publishedCourses
            .Where(c => c.InstructorId != null)
            .Select(c => c.InstructorId!)
            .Distinct()
            .CountAsync();

        var totalReviews = await _db.Reviews
            .AsNoTracking()
            .CountAsync();

        var averageRating = await _db.Reviews
            .AsNoTracking()
            .Select(r => (double?)r.Rating)
            .AverageAsync() ?? 0;

        return Ok(new PublicStatsDto
        {
            TotalCourses = totalCourses,
            TotalStudents = totalStudents,
            TotalInstructors = totalInstructors,
            TotalReviews = totalReviews,
            AverageRating = Math.Round(averageRating, 1)
        });
    }
}
