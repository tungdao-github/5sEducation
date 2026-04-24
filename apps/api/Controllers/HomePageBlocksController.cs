using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/homepage/blocks")]
public class HomePageBlocksController : ControllerBase
{
    private readonly PublicContentService _content;

    public HomePageBlocksController(PublicContentService content)
    {
        _content = content;
    }

    [HttpGet]
    public async Task<ActionResult<List<HomePageBlockDto>>> GetAll([FromQuery] string? locale)
    {
        return Ok(await _content.GetHomePageBlocksAsync(locale));
    }
}
