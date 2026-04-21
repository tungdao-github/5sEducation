using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SearchController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<List<SearchSuggestionDto>>> GetSuggestions([FromQuery] string? query)
    {
        var term = (query ?? string.Empty).Trim();
        if (term.Length < 2)
        {
            return Ok(new List<SearchSuggestionDto>());
        }

        var courseResultsTask = _db.Courses
            .AsNoTracking()
            .Where(c => c.IsPublished && c.Title.Contains(term))
            .OrderByDescending(c => c.UpdatedAt)
            .Take(6)
            .Select(c => new SearchSuggestionDto
            {
                Type = "course",
                Title = c.Title,
                Slug = c.Slug,
                Subtitle = c.Level
            })
            .ToListAsync();

        var pathResultsTask = _db.LearningPaths
            .AsNoTracking()
            .Where(p => p.IsPublished && p.Title.Contains(term))
            .OrderByDescending(p => p.UpdatedAt)
            .Take(4)
            .Select(p => new SearchSuggestionDto
            {
                Type = "path",
                Title = p.Title,
                Slug = p.Slug,
                Subtitle = p.Level
            })
            .ToListAsync();

        await Task.WhenAll(courseResultsTask, pathResultsTask);

        var merged = courseResultsTask.Result.Concat(pathResultsTask.Result).Take(8).ToList();
        return Ok(merged);
    }
}
