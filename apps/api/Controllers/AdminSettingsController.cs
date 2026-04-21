using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminSettingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SystemSettingDto>>> GetAll()
    {
        var settings = await _db.SystemSettings
            .AsNoTracking()
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

        return Ok(settings);
    }

    [HttpPut("{key}")]
    public async Task<ActionResult<SystemSettingDto>> Upsert(string key, SystemSettingUpdateRequest request)
    {
        var normalizedKey = key.Trim();
        if (string.IsNullOrWhiteSpace(normalizedKey))
        {
            return BadRequest("Key is required.");
        }

        var setting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == normalizedKey);
        if (setting is null)
        {
            setting = new SystemSetting
            {
                Key = normalizedKey
            };
            _db.SystemSettings.Add(setting);
        }

        setting.Value = request.Value?.Trim() ?? string.Empty;
        setting.Group = request.Group?.Trim() ?? string.Empty;
        setting.Description = request.Description?.Trim();
        setting.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new SystemSettingDto
        {
            Key = setting.Key,
            Value = setting.Value,
            Group = setting.Group,
            Description = setting.Description,
            UpdatedAt = setting.UpdatedAt
        });
    }
}
