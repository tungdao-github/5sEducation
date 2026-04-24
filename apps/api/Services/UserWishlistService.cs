using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class UserWishlistService
{
    private readonly IUserWishlistRepository _repository;

    public UserWishlistService(IUserWishlistRepository repository)
    {
        _repository = repository;
    }

    public Task<List<WishlistItemDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(userId, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> AddAsync(string userId, WishlistAddRequest request, CancellationToken cancellationToken = default)
    {
        if (!await _repository.CourseExistsAsync(request.CourseId, cancellationToken))
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (await _repository.ExistsAsync(userId, request.CourseId, cancellationToken))
        {
            return AdminCrudResult<object?>.Success();
        }

        await _repository.AddAsync(new WishlistItem
        {
            UserId = userId,
            CourseId = request.CourseId,
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> RemoveAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        var item = await _repository.FindAsync(userId, courseId, cancellationToken);
        if (item is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        await _repository.RemoveAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
