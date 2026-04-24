using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminUsersQueryService
{
    private readonly IAdminUsersRepository _repository;

    public AdminUsersQueryService(IAdminUsersRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await _repository.GetUserSummariesAsync(cancellationToken);
        var courseCounts = await _repository.GetCourseCountsAsync(cancellationToken);
        var rolesByUserId = await _repository.GetRolesByUserIdAsync(cancellationToken);

        return users
            .Select(user =>
            {
                var roles = rolesByUserId.TryGetValue(user.Id, out var roleList)
                    ? roleList
                    : ["User"];

                return MapUser(user, roles, courseCounts.TryGetValue(user.Id, out var count) ? count : 0);
            })
            .ToList();
    }

    public Task<List<string>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetAllRoleNamesAsync(cancellationToken);
    }

    private static UserDto MapUser(AdminUserSummary user, IList<string> roles, int courseCount)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName ?? string.Empty,
            LastName = user.LastName ?? string.Empty,
            AvatarUrl = user.AvatarUrl,
            PhoneNumber = user.PhoneNumber,
            IsAdmin = roles.Any(role => string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)),
            EmailConfirmed = user.EmailConfirmed,
            Roles = roles.ToList(),
            LoyaltyPoints = user.LoyaltyPoints,
            LoyaltyTier = string.IsNullOrWhiteSpace(user.LoyaltyTier) ? "Bronze" : user.LoyaltyTier,
            CourseCount = courseCount,
            Status = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow ? "locked" : "active",
            CreatedAt = user.CreatedAt
        };
    }
}
