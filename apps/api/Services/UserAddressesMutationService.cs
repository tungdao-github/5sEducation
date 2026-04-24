using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class UserAddressesMutationService
{
    private readonly IUserAddressesRepository _repository;

    public UserAddressesMutationService(IUserAddressesRepository repository)
    {
        _repository = repository;
    }

    public async Task<AdminCrudResult<UserAddressDto>> CreateAsync(string userId, UserAddressCreateRequest request, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var address = new UserAddress
        {
            UserId = userId,
            Label = request.Label?.Trim() ?? string.Empty,
            RecipientName = request.RecipientName.Trim(),
            Phone = request.Phone.Trim(),
            Line1 = request.Line1.Trim(),
            Line2 = request.Line2?.Trim(),
            City = request.City.Trim(),
            State = request.State?.Trim() ?? string.Empty,
            PostalCode = request.PostalCode?.Trim() ?? string.Empty,
            Country = request.Country?.Trim() ?? "Vietnam",
            IsDefault = request.IsDefault,
            CreatedAt = now,
            UpdatedAt = now
        };

        if (!await _repository.HasAnyAsync(userId, cancellationToken))
        {
            address.IsDefault = true;
        }

        await _repository.AddAsync(address, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        if (address.IsDefault)
        {
            await ClearOtherDefaultsAsync(userId, address.Id, cancellationToken);
        }

        return AdminCrudResult<UserAddressDto>.Success(Map(address));
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(int id, string userId, UserAddressUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var address = await _repository.FindAsync(id, userId, cancellationToken);
        if (address is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        address.Label = request.Label?.Trim() ?? string.Empty;
        address.RecipientName = request.RecipientName.Trim();
        address.Phone = request.Phone.Trim();
        address.Line1 = request.Line1.Trim();
        address.Line2 = request.Line2?.Trim();
        address.City = request.City.Trim();
        address.State = request.State?.Trim() ?? string.Empty;
        address.PostalCode = request.PostalCode?.Trim() ?? string.Empty;
        address.Country = request.Country?.Trim() ?? "Vietnam";
        address.IsDefault = request.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        if (address.IsDefault)
        {
            await ClearOtherDefaultsAsync(userId, address.Id, cancellationToken);
        }
        else
        {
            var hasDefault = await _repository.GetAllEntitiesAsync(userId, cancellationToken);
            if (!hasDefault.Any(a => a.IsDefault))
            {
                address.IsDefault = true;
                address.UpdatedAt = DateTime.UtcNow;
                await _repository.SaveChangesAsync(cancellationToken);
            }
        }

        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(int id, string userId, CancellationToken cancellationToken = default)
    {
        var address = await _repository.FindAsync(id, userId, cancellationToken);
        if (address is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        var wasDefault = address.IsDefault;
        await _repository.RemoveAsync(address, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        if (wasDefault)
        {
            var next = (await _repository.GetAllEntitiesAsync(userId, cancellationToken))
                .OrderByDescending(a => a.UpdatedAt)
                .FirstOrDefault();

            if (next is not null)
            {
                next.IsDefault = true;
                next.UpdatedAt = DateTime.UtcNow;
                await _repository.SaveChangesAsync(cancellationToken);
            }
        }

        return AdminCrudResult<object?>.Success();
    }

    private async Task ClearOtherDefaultsAsync(string userId, int keepId, CancellationToken cancellationToken)
    {
        var others = (await _repository.GetAllEntitiesAsync(userId, cancellationToken))
            .Where(a => a.Id != keepId && a.IsDefault)
            .ToList();

        if (others.Count == 0)
        {
            return;
        }

        foreach (var item in others)
        {
            item.IsDefault = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        await _repository.SaveChangesAsync(cancellationToken);
    }

    private static UserAddressDto Map(UserAddress address) =>
        new UserAddressDto
        {
            Id = address.Id,
            Label = address.Label,
            RecipientName = address.RecipientName,
            Phone = address.Phone,
            Line1 = address.Line1,
            Line2 = address.Line2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country,
            IsDefault = address.IsDefault,
            CreatedAt = address.CreatedAt,
            UpdatedAt = address.UpdatedAt
        };
}
