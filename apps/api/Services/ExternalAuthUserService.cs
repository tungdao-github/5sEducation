using Microsoft.AspNetCore.Identity;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public sealed record ExternalAuthProfile(
    string Email,
    bool EmailConfirmed,
    string FirstName,
    string LastName,
    string? AvatarUrl);

public class ExternalAuthUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AuthAccountService _authAccountService;

    public ExternalAuthUserService(UserManager<ApplicationUser> userManager, AuthAccountService authAccountService)
    {
        _userManager = userManager;
        _authAccountService = authAccountService;
    }

    public async Task<AuthWorkflowResult<AuthResponse>> UpsertAndBuildResponseAsync(ExternalAuthProfile profile)
    {
        var user = await _userManager.FindByEmailAsync(profile.Email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = profile.Email,
                Email = profile.Email,
                EmailConfirmed = profile.EmailConfirmed,
                FirstName = profile.FirstName,
                LastName = profile.LastName,
                AvatarUrl = profile.AvatarUrl,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return AuthWorkflowResult<AuthResponse>.BadRequest(string.Join(", ", createResult.Errors.Select(error => error.Description)));
            }

            await EnsureUserRoleAsync(user);
            return AuthWorkflowResult<AuthResponse>.Success(await _authAccountService.BuildAuthResponseAsync(user));
        }

        var needsUpdate = false;
        if (profile.EmailConfirmed && !user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            needsUpdate = true;
        }

        if (!string.IsNullOrWhiteSpace(profile.AvatarUrl) && string.IsNullOrWhiteSpace(user.AvatarUrl))
        {
            user.AvatarUrl = profile.AvatarUrl;
            needsUpdate = true;
        }

        if (needsUpdate)
        {
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                return AuthWorkflowResult<AuthResponse>.BadRequest(string.Join(", ", updateResult.Errors.Select(error => error.Description)));
            }
        }

        await EnsureUserRoleAsync(user);
        return AuthWorkflowResult<AuthResponse>.Success(await _authAccountService.BuildAuthResponseAsync(user));
    }

    private async Task EnsureUserRoleAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Count == 0)
        {
            await _userManager.AddToRoleAsync(user, "User");
        }
    }
}
