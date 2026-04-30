using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class GoogleAuthService
{
    private readonly GoogleAuthOptions _googleAuthOptions;
    private readonly ILogger<GoogleAuthService> _logger;
    private readonly ExternalAuthUserService _externalAuthUserService;

    public GoogleAuthService(
        ExternalAuthUserService externalAuthUserService,
        IOptions<GoogleAuthOptions> googleAuthOptions,
        ILogger<GoogleAuthService> logger)
    {
        _externalAuthUserService = externalAuthUserService;
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

        return await _externalAuthUserService.UpsertAndBuildResponseAsync(new ExternalAuthProfile(
            payload.Email,
            payload.EmailVerified,
            ResolveExternalFirstName(payload.GivenName, payload.Name, "Google"),
            ResolveExternalLastName(payload.FamilyName, payload.GivenName, payload.Name, "Google"),
            payload.Picture));
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
