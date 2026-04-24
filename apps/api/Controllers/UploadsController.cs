using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "Admin,Instructor")]
[EnableRateLimiting("auth")]
public class UploadsController : ControllerBase
{
    private readonly UploadsService _uploads;

    public UploadsController(UploadsService uploads)
    {
        _uploads = uploads;
    }

    [HttpPost("video")]
    public async Task<ActionResult<VideoUploadSessionDto>> CreateVideoUpload([FromBody] VideoUploadCreateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result = await _uploads.CreateVideoUploadAsync(userId, User.IsInRole("Admin"), request);
            return result.Status switch
            {
                AdminCrudStatus.Success => Ok(result.Value),
                AdminCrudStatus.NotFound => NotFound(),
                AdminCrudStatus.Forbidden => Forbid(),
                _ => BadRequest(result.Error)
            };
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new ProblemDetails
            {
                Title = "Cloudflare Stream error",
                Detail = ex.Message,
                Status = StatusCodes.Status502BadGateway
            });
        }
    }

    [HttpPost("video/local")]
    [RequestFormLimits(MultipartBodyLengthLimit = 1_073_741_824)]
    [RequestSizeLimit(1_073_741_824)]
    public async Task<ActionResult<LocalVideoUploadResponseDto>> UploadVideoLocal([FromForm] int courseId, [FromForm] IFormFile? file)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _uploads.UploadVideoLocalAsync(userId, User.IsInRole("Admin"), courseId, file);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Forbidden => Forbid(),
            _ => BadRequest(result.Error)
        };
    }
}
