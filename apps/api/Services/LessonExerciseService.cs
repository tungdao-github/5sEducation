using UdemyClone.Api.Repositories;

using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class LessonExerciseService
{
    private readonly LessonExerciseStatusService _statusService;
    private readonly LessonExerciseSubmissionService _submissionService;

    public LessonExerciseService(
        LessonExerciseStatusService statusService,
        LessonExerciseSubmissionService submissionService)
    {
        _statusService = statusService;
        _submissionService = submissionService;
    }

    public async Task<AdminCrudResult<LessonExerciseStatusDto>> GetExerciseStatusAsync(string userId, int lessonId, CancellationToken cancellationToken = default)
    {
        return await _statusService.GetExerciseStatusAsync(userId, lessonId, cancellationToken);
    }

    public async Task<AdminCrudResult<LessonExerciseResultDto>> SubmitExerciseAsync(
        string userId,
        int lessonId,
        LessonExerciseSubmissionRequest request,
        CancellationToken cancellationToken = default)
    {
        return await _submissionService.SubmitExerciseAsync(userId, lessonId, request, cancellationToken);
    }
}
