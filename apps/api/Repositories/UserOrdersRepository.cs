using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Repositories;

public interface IUserOrdersRepository
{
    Task<List<OrderDto>> GetMineAsync(string userId, CancellationToken cancellationToken = default);
}

public sealed class UserOrdersRepository : IUserOrdersRepository
{
    private readonly ApplicationDbContext _db;

    public UserOrdersRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<OrderDto>> GetMineAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                Status = o.Status,
                Subtotal = o.Subtotal,
                DiscountTotal = o.DiscountTotal,
                Total = o.Total,
                Currency = o.Currency,
                CouponCode = o.CouponCode,
                CreatedAt = o.CreatedAt,
                Items = o.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new OrderItemDto
                    {
                        Id = i.Id,
                        CourseId = i.CourseId,
                        CourseTitle = i.CourseTitle,
                        CourseSlug = i.CourseSlug,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity,
                        LineTotal = i.LineTotal
                    })
                    .ToList()
            })
            .ToListAsync(cancellationToken);
    }
}
