using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/lessons")]
public class LessonsController : ControllerBase
{
    private readonly LessonsService _lessons;

    public LessonsController(LessonsService lessons)
    {
        _lessons = lessons;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<LessonDto>>> GetByCourse([FromQuery] int courseId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _lessons.GetByCourseAsync(userId, User.IsInRole("Admin"), courseId);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Forbidden => Forbid(),
            _ => Problem("Unable to load lessons.")
        };
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpPost]
    public async Task<IActionResult> Create(LessonCreateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var result = await _lessons.CreateAsync(userId, User.IsInRole("Admin"), request);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Forbidden => Forbid(),
            _ => BadRequest(result.Error)
        };
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, LessonUpdateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var result = await _lessons.UpdateAsync(userId, User.IsInRole("Admin"), id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Forbidden => Forbid(),
            _ => BadRequest(result.Error)
        };
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var result = await _lessons.DeleteAsync(userId, User.IsInRole("Admin"), id);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Forbidden => Forbid(),
            _ => BadRequest(result.Error)
        };
    }

    [Authorize]
    [HttpGet("{id:int}/exercise/status")]
    public async Task<ActionResult<LessonExerciseStatusDto>> GetExerciseStatus(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _lessons.GetExerciseStatusAsync(userId, id);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Forbidden => Forbid(),
            _ => BadRequest(result.Error)
        };
    }

    [Authorize]
    [HttpPost("{id:int}/exercise/submit")]
    public async Task<ActionResult<LessonExerciseResultDto>> SubmitExercise(
        int id,
        [FromBody] LessonExerciseSubmissionRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _lessons.SubmitExerciseAsync(userId, id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Forbidden => Forbid(),
            _ => BadRequest(result.Error)
        };
    }
}
