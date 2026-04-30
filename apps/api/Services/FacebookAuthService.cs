using System.Text.Json;
using Microsoft.Extensions.Options;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class FacebookAuthService
{
    private readonly FacebookAuthOptions _facebookAuthOptions;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ExternalAuthUserService _externalAuthUserService;

    public FacebookAuthService(
        ExternalAuthUserService externalAuthUserService,
        IOptions<FacebookAuthOptions> facebookAuthOptions,
        IHttpClientFactory httpClientFactory)
    {
        _externalAuthUserService = externalAuthUserService;
        _facebookAuthOptions = facebookAuthOptions.Value;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<AuthWorkflowResult<AuthResponse>> LoginAsync(FacebookLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(_facebookAuthOptions.AppId)
            || string.IsNullOrWhiteSpace(_facebookAuthOptions.AppSecret))
        {
            return AuthWorkflowResult<AuthResponse>.BadRequest("Facebook sign-in is not configured.");
        }

        if (string.IsNullOrWhiteSpace(request.AccessToken))
        {
            return AuthWorkflowResult<AuthResponse>.BadRequest("Facebook access token is required.");
        }

        var client = _httpClientFactory.CreateClient("social-auth");
        var appAccessToken = $"{_facebookAuthOptions.AppId}|{_facebookAuthOptions.AppSecret}";
        using var debugResponse = await client.GetAsync(
            $"https://graph.facebook.com/debug_token?input_token={Uri.EscapeDataString(request.AccessToken)}&access_token={Uri.EscapeDataString(appAccessToken)}");

        if (!debugResponse.IsSuccessStatusCode)
        {
            return AuthWorkflowResult<AuthResponse>.Unauthorized("Invalid Facebook token.");
        }

        using var debugStream = await debugResponse.Content.ReadAsStreamAsync();
        var debugPayload = await JsonSerializer.DeserializeAsync<FacebookDebugTokenResponse>(debugStream);
        if (debugPayload?.Data?.IsValid != true
            || !string.Equals(debugPayload.Data.AppId, _facebookAuthOptions.AppId, StringComparison.Ordinal))
        {
            return AuthWorkflowResult<AuthResponse>.Unauthorized("Invalid Facebook token.");
        }

        using var response = await client.GetAsync(
            $"https://graph.facebook.com/me?fields=id,first_name,last_name,name,email,picture.type(large)&access_token={Uri.EscapeDataString(request.AccessToken)}");

        if (!response.IsSuccessStatusCode)
        {
            return AuthWorkflowResult<AuthResponse>.Unauthorized("Invalid Facebook token.");
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        var payload = await JsonSerializer.DeserializeAsync<FacebookProfileResponse>(stream);
        if (payload is null || string.IsNullOrWhiteSpace(payload.Email))
        {
            return AuthWorkflowResult<AuthResponse>.Unauthorized("Facebook account has no email.");
        }

        var firstName = string.IsNullOrWhiteSpace(payload.FirstName) ? "Facebook" : payload.FirstName;
        var lastName = string.IsNullOrWhiteSpace(payload.LastName) ? firstName : payload.LastName;

        return await _externalAuthUserService.UpsertAndBuildResponseAsync(new ExternalAuthProfile(
            payload.Email,
            true,
            firstName,
            lastName,
            payload.Picture?.Data?.Url));
    }

    private sealed class FacebookProfileResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public FacebookPictureResponse? Picture { get; set; }
    }

    private sealed class FacebookDebugTokenResponse
    {
        public FacebookDebugTokenData? Data { get; set; }
    }

    private sealed class FacebookDebugTokenData
    {
        public bool IsValid { get; set; }
        public string AppId { get; set; } = string.Empty;
        public string? UserId { get; set; }
        public long ExpiresAt { get; set; }
        public long IssuedAt { get; set; }
    }

    private sealed class FacebookPictureResponse
    {
        public FacebookPictureDataResponse? Data { get; set; }
    }

    private sealed class FacebookPictureDataResponse
    {
        public string Url { get; set; } = string.Empty;
    }
}
