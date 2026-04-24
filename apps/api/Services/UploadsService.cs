using Microsoft.AspNetCore.Http;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class UploadsService
{
    private readonly VideoUploadSessionService _sessionService;
    private readonly LocalVideoUploadService _localService;

    public UploadsService(VideoUploadSessionService sessionService, LocalVideoUploadService localService)
    {
        _sessionService = sessionService;
        _localService = localService;
    }

    public async Task<AdminCrudResult<VideoUploadSessionDto>> CreateVideoUploadAsync(
        string userId,
        bool isAdmin,
        VideoUploadCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        return await _sessionService.CreateVideoUploadAsync(userId, isAdmin, request, cancellationToken);
    }

    public async Task<AdminCrudResult<LocalVideoUploadResponseDto>> UploadVideoLocalAsync(
        string userId,
        bool isAdmin,
        int courseId,
        IFormFile? file,
        CancellationToken cancellationToken = default)
    {
        return await _localService.UploadVideoLocalAsync(userId, isAdmin, courseId, file, cancellationToken);
    }
}
