using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Identity;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public class AuthAccountService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;

    public AuthAccountService(UserManager<ApplicationUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> BuildAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var (token, expiresAt) = _tokenService.CreateToken(user, roles);

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = await BuildUserDtoAsync(user, roles)
        };
    }

    public async Task<UserDto> BuildUserDtoAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return await BuildUserDtoAsync(user, roles);
    }

    public Task<UserDto> BuildUserDtoAsync(ApplicationUser user, IList<string> roles)
    {
        return Task.FromResult(new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName ?? string.Empty,
            LastName = user.LastName ?? string.Empty,
            AvatarUrl = user.AvatarUrl,
            PhoneNumber = user.PhoneNumber,
            IsAdmin = roles.Contains("Admin"),
            EmailConfirmed = user.EmailConfirmed,
            Roles = roles.ToList(),
            LoyaltyPoints = user.LoyaltyPoints,
            LoyaltyTier = string.IsNullOrWhiteSpace(user.LoyaltyTier) ? "Bronze" : user.LoyaltyTier,
            CourseCount = 0,
            Status = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow ? "locked" : "active",
            CreatedAt = user.CreatedAt
        });
    }

    public static bool TryBuildResetUri(string resetUrl, string baseUrl, out Uri resetUri, out string error)
    {
        resetUri = null!;
        error = string.Empty;

        if (!Uri.TryCreate(baseUrl.Trim(), UriKind.Absolute, out var baseUri))
        {
            error = "Frontend base URL is invalid.";
            return false;
        }

        if (!Uri.TryCreate(resetUrl.Trim(), UriKind.Absolute, out var requestedUri))
        {
            error = "Reset URL is invalid.";
            return false;
        }

        if (!IsSameOrigin(baseUri, requestedUri))
        {
            error = "Reset URL is not allowed.";
            return false;
        }

        resetUri = requestedUri;
        return true;
    }

    public static string BuildResetLink(Uri resetUri, string email, string encodedToken)
    {
        var builder = new UriBuilder(resetUri)
        {
            Query = $"email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(encodedToken)}"
        };

        return builder.Uri.ToString();
    }

    public static string BuildConfirmLink(Uri baseUri, string userId, string encodedToken)
    {
        var confirmUri = new Uri(baseUri, "/confirm-email");
        var builder = new UriBuilder(confirmUri)
        {
            Query = $"userId={Uri.EscapeDataString(userId)}&token={Uri.EscapeDataString(encodedToken)}"
        };

        return builder.Uri.ToString();
    }

    private static bool IsSameOrigin(Uri left, Uri right)
    {
        if (!string.Equals(left.Scheme, right.Scheme, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (!string.Equals(left.Host, right.Host, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var leftPort = left.IsDefaultPort ? (int?)null : left.Port;
        var rightPort = right.IsDefaultPort ? (int?)null : right.Port;
        return leftPort == rightPort;
    }
}
