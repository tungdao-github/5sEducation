using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public class GoogleAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AuthAccountService _authAccountService;
    private readonly GoogleAuthOptions _googleAuthOptions;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(
        UserManager<ApplicationUser> userManager,
        AuthAccountService authAccountService,
        IOptions<GoogleAuthOptions> googleAuthOptions,
        ILogger<GoogleAuthService> logger)
    {
        _userManager = userManager;
        _authAccountService = authAccountService;
        _googleAuthOptions = googleAuthOptions.Value;
        _logger = logger;
    }

    public async Task<AuthWorkflowResult<AuthResponse>> LoginAsync(GoogleLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(_googleAuthOptions.ClientId))
        {
            return AuthWorkflowResult<AuthResponse>.BadRequest("Google sign-in is not configured.");
        }

        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return AuthWorkflowResult<AuthResponse>.BadRequest("Google token is required.");
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_googleAuthOptions.ClientId]
            });
        }
        catch (InvalidJwtException)
        {
            return AuthWorkflowResult<AuthResponse>.Unauthorized("Invalid Google token.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google sign-in failed.");
            return AuthWorkflowResult<AuthResponse>.BadRequest("Google authentication failed.");
        }

        if (string.IsNullOrWhiteSpace(payload.Email))
        {
            return AuthWorkflowResult<AuthResponse>.Unauthorized("Google account has no email.");
        }

        var user = await _userManager.FindByEmailAsync(payload.Email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = payload.Email,
                Email = payload.Email,
                EmailConfirmed = payload.EmailVerified,
                FirstName = ResolveExternalFirstName(payload.GivenName, payload.Name, "Google"),
                LastName = ResolveExternalLastName(payload.FamilyName, payload.GivenName, payload.Name, "Google"),
                AvatarUrl = payload.Picture,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return AuthWorkflowResult<AuthResponse>.BadRequest(JoinErrors(createResult));
            }

            await EnsureUserRoleAsync(user);
        }
        else
        {
            var needsUpdate = false;
            if (payload.EmailVerified && !user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                needsUpdate = true;
            }

            if (!string.IsNullOrWhiteSpace(payload.Picture) && string.IsNullOrWhiteSpace(user.AvatarUrl))
            {
                user.AvatarUrl = payload.Picture;
                needsUpdate = true;
            }

            if (needsUpdate)
            {
                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    return AuthWorkflowResult<AuthResponse>.BadRequest(JoinErrors(updateResult));
                }
            }

            await EnsureUserRoleAsync(user);
        }

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

    private static string JoinErrors(IdentityResult result)
    {
        return string.Join(", ", result.Errors.Select(error => error.Description));
    }

    private static string ResolveExternalFirstName(string? firstName, string? fullName, string fallback)
    {
        if (!string.IsNullOrWhiteSpace(firstName))
        {
            return firstName;
        }

        if (!string.IsNullOrWhiteSpace(fullName))
        {
            return fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? fallback;
        }

        return fallback;
    }

    private static string ResolveExternalLastName(string? lastName, string? firstName, string? fullName, string fallback)
    {
        if (!string.IsNullOrWhiteSpace(lastName))
        {
            return lastName;
        }

        if (!string.IsNullOrWhiteSpace(fullName))
        {
            var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length > 1)
            {
                return string.Join(' ', parts.Skip(1));
            }
        }

        return !string.IsNullOrWhiteSpace(firstName) ? firstName : fallback;
    }
}
