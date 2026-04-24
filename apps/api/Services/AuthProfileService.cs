using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public class AuthProfileService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AuthAccountService _authAccountService;

    public AuthProfileService(
        UserManager<ApplicationUser> userManager,
        AuthAccountService authAccountService)
    {
        _userManager = userManager;
        _authAccountService = authAccountService;
    }

    public async Task<AuthWorkflowResult<UserDto>> MeAsync(ClaimsPrincipal principal)
    {
        var user = await _userManager.GetUserAsync(principal);
        if (user is null)
        {
            return AuthWorkflowResult<UserDto>.Unauthorized();
        }

        return AuthWorkflowResult<UserDto>.Success(await _authAccountService.BuildUserDtoAsync(user));
    }

    public async Task<AuthWorkflowResult<UserDto>> UpdateMeAsync(ClaimsPrincipal principal, UpdateProfileRequest request)
    {
        var user = await _userManager.GetUserAsync(principal);
        if (user is null)
        {
            return AuthWorkflowResult<UserDto>.Unauthorized();
        }

        if (request.FirstName is not null)
        {
            user.FirstName = request.FirstName.Trim();
        }

        if (request.LastName is not null)
        {
            user.LastName = request.LastName.Trim();
        }

        if (request.AvatarUrl is not null)
        {
            user.AvatarUrl = request.AvatarUrl.Trim();
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return AuthWorkflowResult<UserDto>.BadRequest(JoinErrors(result));
        }

        return AuthWorkflowResult<UserDto>.Success(await _authAccountService.BuildUserDtoAsync(user));
    }

    public async Task<AuthWorkflowResult<object?>> ChangePasswordAsync(ClaimsPrincipal principal, ChangePasswordRequest request)
    {
        var user = await _userManager.GetUserAsync(principal);
        if (user is null)
        {
            return AuthWorkflowResult<object?>.Unauthorized();
        }

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        return result.Succeeded
            ? AuthWorkflowResult<object?>.Success(null)
            : AuthWorkflowResult<object?>.BadRequest(JoinErrors(result));
    }

    private static string JoinErrors(IdentityResult result)
    {
        return string.Join(", ", result.Errors.Select(error => error.Description));
    }
}
