using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/enrollments")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly UserEnrollmentsService _enrollments;

    public EnrollmentsController(UserEnrollmentsService enrollments)
    {
        _enrollments = enrollments;
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<EnrollmentDto>>> MyEnrollments()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await _enrollments.GetMineAsync(userId));
    }

    [HttpPost]
    public async Task<IActionResult> Enroll(EnrollRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _enrollments.EnrollAsync(userId, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(),
            AdminCrudStatus.Conflict => Conflict(result.Error),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }
}
