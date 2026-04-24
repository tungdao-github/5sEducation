using Microsoft.AspNetCore.Http;

namespace UdemyClone.Api.Services;

public class CourseThumbnailStorageService
{
    private readonly IWebHostEnvironment _environment;

    public CourseThumbnailStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<(string? url, string? error)> SaveAsync(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return (null, null);
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif"
        };

        var looksLikeImage = (!string.IsNullOrWhiteSpace(file.ContentType)
                              && file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                             || allowedExtensions.Contains(extension);

        if (!looksLikeImage)
        {
            return (null, "Only image files are supported for thumbnails.");
        }

        var maxBytes = 5 * 1024 * 1024;
        if (file.Length > maxBytes)
        {
            return (null, "Thumbnail must be 5MB or smaller.");
        }

        var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
            ? Path.Combine(_environment.ContentRootPath, "wwwroot")
            : _environment.WebRootPath;

        var uploadsFolder = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream, cancellationToken);

        return ($"/uploads/{fileName}", null);
    }
}
