using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminOrdersService
{
    private readonly IAdminOrdersRepository _repository;

    public AdminOrdersService(IAdminOrdersRepository repository)
    {
        _repository = repository;
    }

    public Task<List<OrderAdminDto>> GetAllAsync(string? status, CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(status, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> UpdateStatusAsync(int id, OrderStatusUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return AdminCrudResult<object?>.BadRequest("Status is required.");
        }

        var order = await _repository.FindByIdAsync(id, cancellationToken);
        if (order is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        order.Status = request.Status.Trim();
        order.UpdatedAt = DateTime.UtcNow;
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
