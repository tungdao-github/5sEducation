using Microsoft.AspNetCore.Identity;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminUsersMutationService
{
    private readonly IAdminUsersRepository _repository;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminUsersMutationService(
        IAdminUsersRepository repository,
        UserManager<ApplicationUser> userManager)
    {
        _repository = repository;
        _userManager = userManager;
    }

    public async Task<AdminUserMutationResult> UpdateRolesAsync(string id, IEnumerable<string> requestedRoles, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return AdminUserMutationResult.NotFound();
        }

        var normalizedRoles = requestedRoles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Select(role => role.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (normalizedRoles.Count == 0)
        {
            normalizedRoles.Add("User");
        }

        if (!normalizedRoles.Contains("User", StringComparer.OrdinalIgnoreCase))
        {
            normalizedRoles.Add("User");
        }

        var existingRoles = await _repository.GetAllRoleNamesAsync(cancellationToken);

        var unknownRoles = normalizedRoles
            .Where(role => !existingRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (unknownRoles.Count > 0)
        {
            return AdminUserMutationResult.BadRequest($"Unknown roles: {string.Join(", ", unknownRoles)}");
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        var removeRoles = currentRoles.Except(normalizedRoles, StringComparer.OrdinalIgnoreCase).ToList();
        var addRoles = normalizedRoles.Except(currentRoles, StringComparer.OrdinalIgnoreCase).ToList();

        if (removeRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, removeRoles);
            if (!removeResult.Succeeded)
            {
                return AdminUserMutationResult.BadRequest(string.Join(", ", removeResult.Errors.Select(e => e.Description)));
            }
        }

        if (addRoles.Count > 0)
        {
            var addResult = await _userManager.AddToRolesAsync(user, addRoles);
            if (!addResult.Succeeded)
            {
                return AdminUserMutationResult.BadRequest(string.Join(", ", addResult.Errors.Select(e => e.Description)));
            }
        }

        return AdminUserMutationResult.Success();
    }

    public async Task<AdminUserMutationResult> UpdateStatusAsync(string id, bool isLocked, string? currentUserId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return AdminUserMutationResult.NotFound();
        }

        if (isLocked && string.Equals(currentUserId, user.Id, StringComparison.Ordinal))
        {
            return AdminUserMutationResult.BadRequest("You cannot lock your own account.");
        }

        user.LockoutEnabled = true;
        var lockoutEnd = isLocked
            ? DateTimeOffset.UtcNow.AddYears(100)
            : (DateTimeOffset?)null;

        var lockResult = await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);
        if (!lockResult.Succeeded)
        {
            return AdminUserMutationResult.BadRequest(string.Join(", ", lockResult.Errors.Select(e => e.Description)));
        }

        if (!isLocked)
        {
            await _userManager.ResetAccessFailedCountAsync(user);
        }

        return AdminUserMutationResult.Success();
    }
}
