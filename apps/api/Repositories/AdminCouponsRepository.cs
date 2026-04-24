using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminCouponsRepository
{
    Task<List<CouponDto>> GetAllAsync(string? search, CancellationToken cancellationToken = default);
    Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<Coupon?> FindAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Coupon coupon, CancellationToken cancellationToken = default);
    Task RemoveAsync(Coupon coupon, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminCouponsRepository : IAdminCouponsRepository
{
    private readonly ApplicationDbContext _db;

    public AdminCouponsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<CouponDto>> GetAllAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = _db.Coupons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = $"%{search.Trim()}%";
            query = query.Where(c =>
                EF.Functions.Like(c.Code, q)
                || (c.Description != null && EF.Functions.Like(c.Description, q)));
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CouponDto
            {
                Id = c.Id,
                Code = c.Code,
                Type = c.Type,
                Value = c.Value,
                MinOrder = c.MinOrder,
                MaxUses = c.MaxUses,
                UsedCount = c.UsedCount,
                ExpiresAt = c.ExpiresAt,
                IsActive = c.IsActive,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Coupons.AsNoTracking().Where(c => c.Code == code);
        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public Task<Coupon?> FindAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Coupons.FindAsync([id], cancellationToken).AsTask();
    }

    public Task AddAsync(Coupon coupon, CancellationToken cancellationToken = default)
    {
        _db.Coupons.Add(coupon);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Coupon coupon, CancellationToken cancellationToken = default)
    {
        _db.Coupons.Remove(coupon);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
