using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public enum AdminUserMutationStatus
{
    Success = 0,
    NotFound = 1,
    BadRequest = 2
}

public sealed class AdminUserMutationResult
{
    public AdminUserMutationStatus Status { get; init; }

    public string? Error { get; init; }

    public static AdminUserMutationResult Success()
    {
        return new AdminUserMutationResult { Status = AdminUserMutationStatus.Success };
    }

    public static AdminUserMutationResult NotFound()
    {
        return new AdminUserMutationResult { Status = AdminUserMutationStatus.NotFound };
    }

    public static AdminUserMutationResult BadRequest(string error)
    {
        return new AdminUserMutationResult
        {
            Status = AdminUserMutationStatus.BadRequest,
            Error = error
        };
    }
}

public class AdminUsersService
{
    private readonly AdminUsersQueryService _queryService;
    private readonly AdminUsersMutationService _mutationService;

    public AdminUsersService(
        AdminUsersQueryService queryService,
        AdminUsersMutationService mutationService)
    {
        _queryService = queryService;
        _mutationService = mutationService;
    }

    public async Task<List<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _queryService.GetAllAsync(cancellationToken);
    }

    public async Task<List<string>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        return await _queryService.GetRolesAsync(cancellationToken);
    }

    public async Task<AdminUserMutationResult> UpdateRolesAsync(string id, IEnumerable<string> requestedRoles, CancellationToken cancellationToken = default)
    {
        return await _mutationService.UpdateRolesAsync(id, requestedRoles, cancellationToken);
    }

    public async Task<AdminUserMutationResult> UpdateStatusAsync(string id, bool isLocked, string? currentUserId, CancellationToken cancellationToken = default)
    {
        return await _mutationService.UpdateStatusAsync(id, isLocked, currentUserId, cancellationToken);
    }
}
