using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class LessonsService
{
    private readonly LessonReadService _readService;
    private readonly LessonMutationService _mutationService;
    private readonly LessonExerciseService _exerciseService;

    public LessonsService(LessonReadService readService, LessonMutationService mutationService, LessonExerciseService exerciseService)
    {
        _readService = readService;
        _mutationService = mutationService;
        _exerciseService = exerciseService;
    }

    public async Task<AdminCrudResult<List<LessonDto>>> GetByCourseAsync(string userId, bool isAdmin, int courseId, CancellationToken cancellationToken = default)
    {
        return await _readService.GetByCourseAsync(userId, isAdmin, courseId, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> CreateAsync(string? userId, bool isAdmin, LessonCreateRequest request, CancellationToken cancellationToken = default)
    {
        return await _mutationService.CreateAsync(userId, isAdmin, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(string? userId, bool isAdmin, int id, LessonUpdateRequest request, CancellationToken cancellationToken = default)
    {
        return await _mutationService.UpdateAsync(userId, isAdmin, id, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(string? userId, bool isAdmin, int id, CancellationToken cancellationToken = default)
    {
        return await _mutationService.DeleteAsync(userId, isAdmin, id, cancellationToken);
    }

    public async Task<AdminCrudResult<LessonExerciseStatusDto>> GetExerciseStatusAsync(string userId, int lessonId, CancellationToken cancellationToken = default)
    {
        return await _exerciseService.GetExerciseStatusAsync(userId, lessonId, cancellationToken);
    }

    public async Task<AdminCrudResult<LessonExerciseResultDto>> SubmitExerciseAsync(
        string userId,
        int lessonId,
        LessonExerciseSubmissionRequest request,
        CancellationToken cancellationToken = default)
    {
        return await _exerciseService.SubmitExerciseAsync(userId, lessonId, request, cancellationToken);
    }
}
