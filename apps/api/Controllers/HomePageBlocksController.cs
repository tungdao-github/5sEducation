using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/homepage/blocks")]
public class HomePageBlocksController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public HomePageBlocksController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<HomePageBlockDto>>> GetAll([FromQuery] string? locale)
    {
        var normalizedLocale = (locale ?? string.Empty).Trim().ToLowerInvariant();

        var blocks = await _db.HomePageBlocks
            .Where(b => b.IsPublished)
            .Where(b => string.IsNullOrEmpty(b.Locale) || b.Locale.ToLower() == normalizedLocale)
            .OrderBy(b => b.SortOrder)
            .ThenBy(b => b.Id)
            .Select(b => new HomePageBlockDto
            {
                Id = b.Id,
                Key = b.Key,
                Type = b.Type,
                Title = b.Title,
                Subtitle = b.Subtitle,
                ImageUrl = b.ImageUrl,
                CtaText = b.CtaText,
                CtaUrl = b.CtaUrl,
                ItemsJson = b.ItemsJson,
                Locale = b.Locale,
                SortOrder = b.SortOrder,
                IsPublished = b.IsPublished
            })
            .ToListAsync();

        return Ok(blocks);
    }
}
