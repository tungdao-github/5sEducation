using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly PublicContentService _content;

    public SettingsController(PublicContentService content)
    {
        _content = content;
    }

    [HttpGet]
    public async Task<ActionResult<List<SystemSettingDto>>> GetAll([FromQuery] string? group, [FromQuery] string? keys)
    {
        return Ok(await _content.GetSettingsAsync(group, keys));
    }
}
