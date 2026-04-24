using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminCouponsService
{
    private readonly IAdminCouponsRepository _repository;

    public AdminCouponsService(IAdminCouponsRepository repository)
    {
        _repository = repository;
    }

    public Task<List<CouponDto>> GetAllAsync(string? search, CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(search, cancellationToken);
    }

    public async Task<AdminCrudResult<CouponDto>> CreateAsync(CouponCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return AdminCrudResult<CouponDto>.BadRequest("Code is required.");
        }

        var code = request.Code.Trim().ToUpperInvariant();
        if (await _repository.CodeExistsAsync(code, cancellationToken: cancellationToken))
        {
            return AdminCrudResult<CouponDto>.Conflict("Coupon code already exists.");
        }

        var now = DateTime.UtcNow;
        var coupon = new Coupon
        {
            Code = code,
            Description = request.Description?.Trim(),
            Type = CouponHelper.NormalizeType(request.Type),
            Value = Math.Max(0, request.Value),
            MinOrder = Math.Max(0, request.MinOrder),
            MaxUses = Math.Max(0, request.MaxUses),
            ExpiresAt = request.ExpiresAt,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(coupon, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<CouponDto>.Success(CouponHelper.MapCoupon(coupon));
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(int id, CouponUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var coupon = await _repository.FindAsync(id, cancellationToken);
        if (coupon is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var code = request.Code.Trim().ToUpperInvariant();
            if (await _repository.CodeExistsAsync(code, id, cancellationToken))
            {
                return AdminCrudResult<object?>.Conflict("Coupon code already exists.");
            }

            coupon.Code = code;
        }

        coupon.Description = request.Description?.Trim();
        coupon.Type = CouponHelper.NormalizeType(request.Type);
        coupon.Value = Math.Max(0, request.Value);
        coupon.MinOrder = Math.Max(0, request.MinOrder);
        coupon.MaxUses = Math.Max(0, request.MaxUses);
        coupon.ExpiresAt = request.ExpiresAt;
        coupon.IsActive = request.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var coupon = await _repository.FindAsync(id, cancellationToken);
        if (coupon is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        await _repository.RemoveAsync(coupon, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
