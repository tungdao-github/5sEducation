using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminUsersRepository
{
    Task<List<AdminUserSummary>> GetUserSummariesAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<string, int>> GetCourseCountsAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<string, List<string>>> GetRolesByUserIdAsync(CancellationToken cancellationToken = default);
    Task<List<string>> GetAllRoleNamesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminUserSummary
{
    public string Id { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? AvatarUrl { get; init; }
    public string? PhoneNumber { get; init; }
    public bool EmailConfirmed { get; init; }
    public int LoyaltyPoints { get; init; }
    public string? LoyaltyTier { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public DateTime CreatedAt { get; init; }
}

public sealed class AdminUsersRepository : IAdminUsersRepository
{
    private readonly ApplicationDbContext _db;

    public AdminUsersRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<AdminUserSummary>> GetUserSummariesAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAt)
            .Select(user => new AdminUserSummary
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                PhoneNumber = user.PhoneNumber,
                EmailConfirmed = user.EmailConfirmed,
                LoyaltyPoints = user.LoyaltyPoints,
                LoyaltyTier = user.LoyaltyTier,
                LockoutEnd = user.LockoutEnd,
                CreatedAt = user.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<string, int>> GetCourseCountsAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Enrollments
            .AsNoTracking()
            .GroupBy(enrollment => enrollment.UserId)
            .Select(group => new
            {
                UserId = group.Key,
                Count = group.Count()
            })
            .ToDictionaryAsync(item => item.UserId, item => item.Count, cancellationToken);
    }

    public async Task<Dictionary<string, List<string>>> GetRolesByUserIdAsync(CancellationToken cancellationToken = default)
    {
        var roleEntries = await (
                from userRole in _db.UserRoles.AsNoTracking()
                join role in _db.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                select new
                {
                    userRole.UserId,
                    RoleName = role.Name
                })
            .Where(item => !string.IsNullOrWhiteSpace(item.RoleName))
            .ToListAsync(cancellationToken);

        return roleEntries
            .GroupBy(item => item.UserId)
            .ToDictionary(
                group => group.Key,
                group => group
                    .Select(item => item.RoleName!)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(name => name)
                    .ToList());
    }

    public async Task<List<string>> GetAllRoleNamesAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Roles
            .AsNoTracking()
            .Select(role => role.Name)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name!)
            .OrderBy(name => name)
            .ToListAsync(cancellationToken);
    }
}
