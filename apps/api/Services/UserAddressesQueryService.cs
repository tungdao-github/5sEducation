using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class UserAddressesQueryService
{
    private readonly IUserAddressesRepository _repository;

    public UserAddressesQueryService(IUserAddressesRepository repository)
    {
        _repository = repository;
    }

    public Task<List<UserAddressDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(userId, cancellationToken);
    }
}
