using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class CartService
{
    private readonly ICartRepository _repository;

    public CartService(ICartRepository repository)
    {
        _repository = repository;
    }

    public Task<List<CartItemDto>> GetCartAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _repository.GetCartAsync(userId, cancellationToken);
    }

    public async Task<bool> AddAsync(string userId, CartAddRequest request, CancellationToken cancellationToken = default)
    {
        var isPublished = await _repository.IsCoursePublishedAsync(request.CourseId, cancellationToken);
        if (!isPublished)
        {
            return false;
        }

        var quantity = Math.Max(1, request.Quantity);
        var existing = await _repository.FindCartItemAsync(userId, request.CourseId, cancellationToken);
        if (existing is null)
        {
            await _repository.AddCartItemAsync(new CartItem
            {
                UserId = userId,
                CourseId = request.CourseId,
                Quantity = quantity
            }, cancellationToken);
        }
        else
        {
            existing.Quantity = quantity;
        }

        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> RemoveAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        var item = await _repository.FindCartItemAsync(userId, courseId, cancellationToken);
        if (item is null)
        {
            return false;
        }

        await _repository.RemoveCartItemAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }
}
