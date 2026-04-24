using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface ICartRepository
{
    Task<List<CartItemDto>> GetCartAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> IsCoursePublishedAsync(int courseId, CancellationToken cancellationToken = default);
    Task<CartItem?> FindCartItemAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task AddCartItemAsync(CartItem cartItem, CancellationToken cancellationToken = default);
    Task RemoveCartItemAsync(CartItem cartItem, CancellationToken cancellationToken = default);
    Task<List<CartCheckoutItem>> GetCheckoutItemsAsync(string userId, CancellationToken cancellationToken = default);
    Task<List<int>> GetEnrollmentCourseIdsAsync(string userId, CancellationToken cancellationToken = default);
    Task<Coupon?> FindCouponByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<ApplicationUser?> FindUserAsync(string userId, CancellationToken cancellationToken = default);
    Task AddOrderAsync(Order order, CancellationToken cancellationToken = default);
    Task AddEnrollmentAsync(Enrollment enrollment, CancellationToken cancellationToken = default);
    Task RemoveCartItemsByIdAsync(IEnumerable<int> cartItemIds, CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class CartCheckoutItem
{
    public int Id { get; init; }
    public int CourseId { get; init; }
    public string CourseTitle { get; init; } = string.Empty;
    public string CourseSlug { get; init; } = string.Empty;
    public decimal CoursePrice { get; init; }
    public decimal? CourseFlashSalePrice { get; init; }
    public DateTime? CourseFlashSaleStartsAt { get; init; }
    public DateTime? CourseFlashSaleEndsAt { get; init; }
    public bool CourseIsPublished { get; init; }
    public int Quantity { get; init; }
}

public sealed class CartRepository : ICartRepository
{
    private readonly ApplicationDbContext _db;

    public CartRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<CartItemDto>> GetCartAsync(string userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _db.CartItems
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Select(c => new CartItemDto
            {
                Id = c.Id,
                CourseId = c.CourseId,
                CourseTitle = c.Course != null ? c.Course.Title : string.Empty,
                CourseSlug = c.Course != null ? c.Course.Slug : string.Empty,
                ThumbnailUrl = c.Course != null ? c.Course.ThumbnailUrl : string.Empty,
                Price = c.Course != null
                    && c.Course.FlashSalePrice.HasValue
                    && c.Course.FlashSalePrice.Value > 0
                    && c.Course.FlashSalePrice.Value < c.Course.Price
                    && (!c.Course.FlashSaleStartsAt.HasValue || c.Course.FlashSaleStartsAt.Value <= now)
                    && (!c.Course.FlashSaleEndsAt.HasValue || c.Course.FlashSaleEndsAt.Value >= now)
                        ? c.Course.FlashSalePrice.Value
                        : (c.Course != null ? c.Course.Price : 0),
                Quantity = c.Quantity
            })
            .ToListAsync(cancellationToken);
    }

    public Task<bool> IsCoursePublishedAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Courses
            .AsNoTracking()
            .AnyAsync(course => course.Id == courseId && course.IsPublished, cancellationToken);
    }

    public Task<CartItem?> FindCartItemAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.CartItems.FirstOrDefaultAsync(item => item.UserId == userId && item.CourseId == courseId, cancellationToken);
    }

    public Task AddCartItemAsync(CartItem cartItem, CancellationToken cancellationToken = default)
    {
        _db.CartItems.Add(cartItem);
        return Task.CompletedTask;
    }

    public Task RemoveCartItemAsync(CartItem cartItem, CancellationToken cancellationToken = default)
    {
        _db.CartItems.Remove(cartItem);
        return Task.CompletedTask;
    }

    public async Task<List<CartCheckoutItem>> GetCheckoutItemsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _db.CartItems
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Select(c => new CartCheckoutItem
            {
                Id = c.Id,
                CourseId = c.CourseId,
                CourseTitle = c.Course != null ? c.Course.Title : string.Empty,
                CourseSlug = c.Course != null ? c.Course.Slug : string.Empty,
                CoursePrice = c.Course != null ? c.Course.Price : 0m,
                CourseFlashSalePrice = c.Course != null ? c.Course.FlashSalePrice : null,
                CourseFlashSaleStartsAt = c.Course != null ? c.Course.FlashSaleStartsAt : null,
                CourseFlashSaleEndsAt = c.Course != null ? c.Course.FlashSaleEndsAt : null,
                CourseIsPublished = c.Course != null && c.Course.IsPublished,
                Quantity = c.Quantity
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<int>> GetEnrollmentCourseIdsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _db.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .Select(e => e.CourseId)
            .ToListAsync(cancellationToken);
    }

    public Task<Coupon?> FindCouponByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return _db.Coupons.FirstOrDefaultAsync(coupon => coupon.Code == code, cancellationToken);
    }

    public Task<ApplicationUser?> FindUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _db.Users.FirstOrDefaultAsync(user => user.Id == userId, cancellationToken);
    }

    public Task AddOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        _db.Orders.Add(order);
        return Task.CompletedTask;
    }

    public Task AddEnrollmentAsync(Enrollment enrollment, CancellationToken cancellationToken = default)
    {
        _db.Enrollments.Add(enrollment);
        return Task.CompletedTask;
    }

    public Task RemoveCartItemsByIdAsync(IEnumerable<int> cartItemIds, CancellationToken cancellationToken = default)
    {
        _db.CartItems.RemoveRange(cartItemIds.Select(id => new CartItem { Id = id }));
        return Task.CompletedTask;
    }

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        return _db.Database.BeginTransactionAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
