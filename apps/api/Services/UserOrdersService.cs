using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class UserOrdersService
{
    private readonly IUserOrdersRepository _repository;

    public UserOrdersService(IUserOrdersRepository repository)
    {
        _repository = repository;
    }

    public Task<List<OrderDto>> GetMineAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _repository.GetMineAsync(userId, cancellationToken);
    }
}
