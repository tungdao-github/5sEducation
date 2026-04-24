using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminOrdersRepository
{
    Task<List<OrderAdminDto>> GetAllAsync(string? status, CancellationToken cancellationToken = default);
    Task<Order?> FindByIdAsync(int id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminOrdersRepository : IAdminOrdersRepository
{
    private readonly ApplicationDbContext _db;

    public AdminOrdersRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<OrderAdminDto>> GetAllAsync(string? status, CancellationToken cancellationToken = default)
    {
        var query = _db.Orders.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status == status);
        }

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderAdminDto
            {
                Id = o.Id,
                Status = o.Status,
                Subtotal = o.Subtotal,
                DiscountTotal = o.DiscountTotal,
                Total = o.Total,
                Currency = o.Currency,
                CouponCode = o.CouponCode,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                UserId = o.UserId,
                UserEmail = o.User != null ? (o.User.Email ?? string.Empty) : string.Empty,
                UserName = o.User != null ? (o.User.FirstName + " " + o.User.LastName).Trim() : string.Empty,
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

    public Task<Order?> FindByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Orders.FirstOrDefaultAsync(order => order.Id == id, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
