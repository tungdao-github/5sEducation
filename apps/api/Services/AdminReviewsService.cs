using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminReviewsService
{
    private readonly IAdminReviewsRepository _repository;

    public AdminReviewsService(IAdminReviewsRepository repository)
    {
        _repository = repository;
    }

    public Task<List<AdminReviewDto>> GetAllAsync(int? courseId, string? query, int? take, CancellationToken cancellationToken = default)
    {
        var limit = Math.Clamp(take ?? 120, 20, 500);
        return _repository.GetAllAsync(courseId, query, limit, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var review = await _repository.FindAsync(id, cancellationToken);
        if (review is null)
        {
            return false;
        }

        await _repository.RemoveAsync(review, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }
}
