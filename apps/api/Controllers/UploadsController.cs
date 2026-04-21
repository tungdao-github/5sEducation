using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "Admin,Instructor")]
[EnableRateLimiting("auth")]
public class UploadsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly CloudflareStreamService _streamService;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<UploadsController> _logger;

    public UploadsController(
        ApplicationDbContext db,
        CloudflareStreamService streamService,
        IWebHostEnvironment env,
        ILogger<UploadsController> logger)
    {
        _db = db;
        _streamService = streamService;
        _env = env;
        _logger = logger;
    }

    [HttpPost("video")]
    public async Task<ActionResult<VideoUploadSessionDto>> CreateVideoUpload([FromBody] VideoUploadCreateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var course = await _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == request.CourseId);
        if (course is null)
        {
            return NotFound();
        }

        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && course.InstructorId != userId)
        {
            return Forbid();
        }

        try
        {
            var session = await _streamService.CreateDirectUploadAsync(request.MaxDurationSeconds);
            return Ok(new VideoUploadSessionDto
            {
                UploadUrl = session.UploadUrl,
                VideoUid = session.VideoUid,
                PlayerUrl = session.PlayerUrl
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cloudflare Stream upload session failed.");
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
        if (file is null || file.Length == 0)
        {
            return BadRequest("Please choose a video file.");
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var course = await _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null)
        {
            return NotFound();
        }

        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && course.InstructorId != userId)
        {
            return Forbid();
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".mp4",
            ".m4v",
            ".mov",
            ".webm",
            ".mkv",
            ".avi"
        };

        var looksLikeVideo = (!string.IsNullOrWhiteSpace(file.ContentType)
                              && file.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
                             || allowedExtensions.Contains(extension);
        if (!looksLikeVideo)
        {
            return BadRequest("Only video files are supported.");
        }

        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = ".mp4";
        }

        var webRoot = string.IsNullOrWhiteSpace(_env.WebRootPath)
            ? Path.Combine(_env.ContentRootPath, "wwwroot")
            : _env.WebRootPath;

        var videosFolder = Path.Combine(webRoot, "uploads", "videos");
        Directory.CreateDirectory(videosFolder);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(videosFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new LocalVideoUploadResponseDto
        {
            VideoUrl = $"/uploads/videos/{fileName}",
            FileName = fileName
        });
    }
}
