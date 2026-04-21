using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SettingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SystemSettingDto>>> GetAll([FromQuery] string? group, [FromQuery] string? keys)
    {
        var query = _db.SystemSettings.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(group))
        {
            query = query.Where(s => s.Group == group);
        }

        if (!string.IsNullOrWhiteSpace(keys))
        {
            var keyList = keys
                .Split(",", StringSplitOptions.RemoveEmptyEntries)
                .Select(k => k.Trim())
                .Where(k => k.Length > 0)
                .ToList();

            if (keyList.Count > 0)
            {
                query = query.Where(s => keyList.Contains(s.Key));
            }
        }

        var results = await query
            .OrderBy(s => s.Group)
            .ThenBy(s => s.Key)
            .Select(s => new SystemSettingDto
            {
                Key = s.Key,
                Value = s.Value,
                Group = s.Group,
                Description = s.Description,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return Ok(results);
    }
}
