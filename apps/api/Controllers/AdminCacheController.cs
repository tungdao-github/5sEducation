using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/cache")]
[Authorize(Roles = "Admin")]
public class AdminCacheController : ControllerBase
{
    private readonly AdminSettingsService _settings;

    public AdminCacheController(AdminSettingsService settings)
    {
        _settings = settings;
    }

    [HttpPost("clear")]
    public async Task<IActionResult> Clear()
    {
        var version = await _settings.BumpCacheVersionAsync();
        return Ok(new { message = "Cache version updated.", version });
    }
}
