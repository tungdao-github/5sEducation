using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminAuditLogsService
{
    private readonly IAdminAuditLogsRepository _repository;

    public AdminAuditLogsService(IAdminAuditLogsRepository repository)
    {
        _repository = repository;
    }

    public Task<List<AdminAuditLogDto>> GetAllAsync(
        string? query,
        string? userId,
        DateTime? from,
        DateTime? to,
        int take,
        CancellationToken cancellationToken = default)
    {
        var normalizedTake = Math.Clamp(take, 1, 200);
        return _repository.GetAllAsync(query, userId, from, to, normalizedTake, cancellationToken);
    }
}
