using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class HistoryService
{
    private readonly IHistoryRepository _repository;

    public HistoryService(IHistoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<AdminCrudResult<object?>> RecordViewAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        var existing = await _repository.FindViewAsync(userId, courseId, cancellationToken);
        if (existing is null)
        {
            await _repository.UpsertViewAsync(new CourseViewHistory
            {
                UserId = userId,
                CourseId = courseId,
                ViewedAt = DateTime.UtcNow
            }, cancellationToken);
        }
        else
        {
            existing.ViewedAt = DateTime.UtcNow;
        }

        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public Task<List<CourseHistoryDto>> GetViewsAsync(string userId, int take, CancellationToken cancellationToken = default)
    {
        return _repository.GetViewsAsync(userId, take, cancellationToken);
    }
}
