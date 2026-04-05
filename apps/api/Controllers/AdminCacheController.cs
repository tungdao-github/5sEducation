using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/cache")]
[Authorize(Roles = "Admin")]
public class AdminCacheController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminCacheController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPost("clear")]
    public async Task<IActionResult> Clear()
    {
        var setting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == "cacheVersion");
        var now = DateTime.UtcNow;
        if (setting is null)
        {
            setting = new SystemSetting
            {
                Key = "cacheVersion",
                Value = now.Ticks.ToString(),
                Group = "system",
                UpdatedAt = now
            };
            _db.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = now.Ticks.ToString();
            setting.UpdatedAt = now;
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Cache version updated.", version = setting.Value });
    }
}
