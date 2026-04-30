using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class LocalVideoUploadService
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".mp4",
        ".m4v",
        ".mov",
        ".webm",
        ".mkv",
        ".avi"
    };

    private readonly ILessonsRepository _lessons;
    private readonly IWebHostEnvironment _env;

    public LocalVideoUploadService(ILessonsRepository lessons, IWebHostEnvironment env)
    {
        _lessons = lessons;
        _env = env;
    }

    public async Task<AdminCrudResult<LocalVideoUploadResponseDto>> UploadVideoLocalAsync(
        string userId,
        bool isAdmin,
        int? courseId,
        IFormFile? file,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return AdminCrudResult<LocalVideoUploadResponseDto>.BadRequest("Please choose a video file.");
        }

        if (courseId.HasValue && courseId.Value > 0)
        {
            var course = await _lessons.FindCourseAsync(courseId.Value, cancellationToken);
            if (course is null)
            {
                return AdminCrudResult<LocalVideoUploadResponseDto>.NotFound();
            }

            if (!isAdmin && course.InstructorId != userId)
            {
                return AdminCrudResult<LocalVideoUploadResponseDto>.Forbidden();
            }
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var looksLikeVideo = (!string.IsNullOrWhiteSpace(file.ContentType)
                              && file.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
                             || AllowedExtensions.Contains(extension);
        if (!looksLikeVideo)
        {
            return AdminCrudResult<LocalVideoUploadResponseDto>.BadRequest("Only video files are supported.");
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
            await file.CopyToAsync(stream, cancellationToken);
        }

        return AdminCrudResult<LocalVideoUploadResponseDto>.Success(new LocalVideoUploadResponseDto
        {
            VideoUrl = $"/uploads/videos/{fileName}",
            FileName = fileName
        });
    }
}
