using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly UserProgressService _progress;

    public ProgressController(UserProgressService progress)
    {
        _progress = progress;
    }

    [HttpGet("{courseId:int}")]
    public async Task<ActionResult<ProgressSnapshotDto>> GetProgress(int courseId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var snapshot = await _progress.GetProgressAsync(userId, courseId);
        if (snapshot is null)
        {
            return Forbid();
        }

        return Ok(snapshot);
    }

    [HttpPost]
    public async Task<ActionResult<ProgressSnapshotDto>> UpdateProgress([FromBody] ProgressUpdateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _progress.UpdateProgressAsync(userId, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.NotFound => Forbid(),
            AdminCrudStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to update progress.")
        };
    }
}
