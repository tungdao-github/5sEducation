using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/history")]
[Authorize]
public class HistoryController : ControllerBase
{
    private readonly HistoryService _history;

    public HistoryController(HistoryService history)
    {
        _history = history;
    }

    [HttpPost("views")]
    public async Task<IActionResult> RecordView([FromBody] CourseViewCreateRequest request)
    {
        if (request.CourseId <= 0)
        {
            return BadRequest("CourseId is required.");
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _history.RecordViewAsync(userId, request.CourseId);
        return result.Status == AdminCrudStatus.Success ? Ok() : Problem("Unable to record view.");
    }

    [HttpGet("views")]
    public async Task<ActionResult<List<CourseHistoryDto>>> GetViews([FromQuery] int? limit)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var take = Math.Clamp(limit ?? 8, 1, 50);
        return Ok(await _history.GetViewsAsync(userId, take));
    }
}
