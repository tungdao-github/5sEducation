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

        var courseResults = await _db.Courses
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

        var pathResults = await _db.LearningPaths
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

        var merged = courseResults.Concat(pathResults).Take(8).ToList();
        return Ok(merged);
    }
}
