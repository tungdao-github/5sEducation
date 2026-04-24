using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public sealed class CartCheckoutResult
{
    public bool Success { get; init; }

    public string? Error { get; init; }

    public OrderDto? Order { get; init; }

    public static CartCheckoutResult Fail(string error)
    {
        return new CartCheckoutResult
        {
            Success = false,
            Error = error
        };
    }

    public static CartCheckoutResult Ok(OrderDto order)
    {
        return new CartCheckoutResult
        {
            Success = true,
            Order = order
        };
    }
}

public class CartCheckoutService
{
    private readonly CartService _cartService;
    private readonly CartCheckoutFlowService _checkoutFlow;

    public CartCheckoutService(CartService cartService, CartCheckoutFlowService checkoutFlow)
    {
        _cartService = cartService;
        _checkoutFlow = checkoutFlow;
    }

    public async Task<List<CartItemDto>> GetCartAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _cartService.GetCartAsync(userId, cancellationToken);
    }

    public async Task<bool> AddAsync(string userId, CartAddRequest request, CancellationToken cancellationToken = default)
    {
        return await _cartService.AddAsync(userId, request, cancellationToken);
    }

    public async Task<bool> RemoveAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return await _cartService.RemoveAsync(userId, courseId, cancellationToken);
    }

    public async Task<CartCheckoutResult> CheckoutAsync(
        string userId,
        CartCheckoutRequest? request,
        CancellationToken cancellationToken = default)
    {
        return await _checkoutFlow.CheckoutAsync(userId, request, cancellationToken);
    }
}
