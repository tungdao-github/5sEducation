using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/stats")]
public class StatsController : ControllerBase
{
    private readonly PublicContentService _content;

    public StatsController(PublicContentService content)
    {
        _content = content;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<PublicStatsDto>> GetSummary()
    {
        return Ok(await _content.GetPublicStatsAsync());
    }
}
