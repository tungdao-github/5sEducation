using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class VideoUploadSessionService
{
    private readonly ILessonsRepository _lessons;
    private readonly CloudflareStreamService _streamService;
    private readonly ILogger<VideoUploadSessionService> _logger;

    public VideoUploadSessionService(
        ILessonsRepository lessons,
        CloudflareStreamService streamService,
        ILogger<VideoUploadSessionService> logger)
    {
        _lessons = lessons;
        _streamService = streamService;
        _logger = logger;
    }

    public async Task<AdminCrudResult<VideoUploadSessionDto>> CreateVideoUploadAsync(
        string userId,
        bool isAdmin,
        VideoUploadCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await _lessons.FindCourseAsync(request.CourseId, cancellationToken);
        if (course is null)
        {
            return AdminCrudResult<VideoUploadSessionDto>.NotFound();
        }

        if (!isAdmin && course.InstructorId != userId)
        {
            return AdminCrudResult<VideoUploadSessionDto>.Forbidden();
        }

        try
        {
            var session = await _streamService.CreateDirectUploadAsync(request.MaxDurationSeconds);
            return AdminCrudResult<VideoUploadSessionDto>.Success(new VideoUploadSessionDto
            {
                UploadUrl = session.UploadUrl,
                VideoUid = session.VideoUid,
                PlayerUrl = session.PlayerUrl
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cloudflare Stream upload session failed.");
            throw;
        }
    }
}
