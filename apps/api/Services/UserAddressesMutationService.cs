using UdemyClone.Api.Dtos;
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
        var draft = UserAddressMutationHelper.BuildDraft(userId, request);
        var address = new Models.UserAddress
        {
            UserId = draft.UserId,
            Label = draft.Label,
            RecipientName = draft.RecipientName,
            Phone = draft.Phone,
            Line1 = draft.Line1,
            Line2 = draft.Line2,
            City = draft.City,
            State = draft.State,
            PostalCode = draft.PostalCode,
            Country = draft.Country,
            IsDefault = draft.IsDefault,
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

        return AdminCrudResult<UserAddressDto>.Success(UserAddressMutationHelper.Map(address));
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(int id, string userId, UserAddressUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var address = await _repository.FindAsync(id, userId, cancellationToken);
        if (address is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        var draft = UserAddressMutationHelper.BuildDraft(address, request);
        UserAddressMutationHelper.ApplyDraft(address, draft);

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

}
