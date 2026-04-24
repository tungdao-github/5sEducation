using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class UserAddressesService
{
    private readonly UserAddressesQueryService _queryService;
    private readonly UserAddressesMutationService _mutationService;

    public UserAddressesService(UserAddressesQueryService queryService, UserAddressesMutationService mutationService)
    {
        _queryService = queryService;
        _mutationService = mutationService;
    }

    public Task<List<UserAddressDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _queryService.GetAllAsync(userId, cancellationToken);
    }

    public async Task<AdminCrudResult<UserAddressDto>> CreateAsync(string userId, UserAddressCreateRequest request, CancellationToken cancellationToken = default)
    {
        return await _mutationService.CreateAsync(userId, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(int id, string userId, UserAddressUpdateRequest request, CancellationToken cancellationToken = default)
    {
        return await _mutationService.UpdateAsync(id, userId, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(int id, string userId, CancellationToken cancellationToken = default)
    {
        return await _mutationService.DeleteAsync(id, userId, cancellationToken);
    }
}
