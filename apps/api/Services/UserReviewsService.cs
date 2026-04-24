using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class UserReviewsService
{
    private readonly IUserReviewsRepository _repository;

    public UserReviewsService(IUserReviewsRepository repository)
    {
        _repository = repository;
    }

    public Task<List<ReviewDto>> GetByCourseAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _repository.GetByCourseAsync(courseId, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> UpsertAsync(string userId, ReviewCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (!await _repository.CourseExistsAsync(request.CourseId, cancellationToken))
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (!await _repository.IsEnrolledAsync(userId, request.CourseId, cancellationToken))
        {
            return AdminCrudResult<object?>.BadRequest("Enroll in the course before leaving a review.");
        }

        var existing = await _repository.FindAsync(userId, request.CourseId, cancellationToken);
        if (existing is null)
        {
            await _repository.AddAsync(new Review
            {
                UserId = userId,
                CourseId = request.CourseId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }, cancellationToken);
        }
        else
        {
            existing.Rating = request.Rating;
            existing.Comment = request.Comment;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        var review = await _repository.FindAsync(userId, courseId, cancellationToken);
        if (review is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        await _repository.RemoveAsync(review, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
