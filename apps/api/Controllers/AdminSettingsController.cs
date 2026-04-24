using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ControllerBase
{
    private readonly AdminSettingsService _settings;

    public AdminSettingsController(AdminSettingsService settings)
    {
        _settings = settings;
    }

    [HttpGet]
    public async Task<ActionResult<List<SystemSettingDto>>> GetAll()
    {
        return Ok(await _settings.GetAllAsync());
    }

    [HttpPut("{key}")]
    public async Task<ActionResult<SystemSettingDto>> Upsert(string key, SystemSettingUpdateRequest request)
    {
        var result = await _settings.UpsertAsync(key, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to update setting.")
        };
    }
}
