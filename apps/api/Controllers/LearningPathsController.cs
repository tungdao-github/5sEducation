using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/learning-paths")]
public class LearningPathsController : ControllerBase
{
    private readonly LearningPathsService _paths;

    public LearningPathsController(LearningPathsService paths)
    {
        _paths = paths;
    }

    [HttpGet]
    public async Task<ActionResult<List<LearningPathListDto>>> GetAll()
    {
        return Ok(await _paths.GetAllAsync());
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<LearningPathDetailDto>> GetBySlug(string slug)
    {
        var userId = User.Identity?.IsAuthenticated == true
            ? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            : null;

        var detail = await _paths.GetBySlugAsync(slug, User.IsInRole("Admin"), userId);
        return detail is null ? NotFound() : Ok(detail);
    }
}
