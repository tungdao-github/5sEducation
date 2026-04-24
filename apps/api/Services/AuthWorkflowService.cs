using System.Security.Claims;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public enum AuthWorkflowStatus
{
    Success = 0,
    BadRequest = 1,
    Unauthorized = 2,
    Forbidden = 3,
    Locked = 4,
    ServerError = 5
}

public sealed class AuthWorkflowResult<T>
{
    public AuthWorkflowStatus Status { get; init; }
    public T? Value { get; init; }
    public string? Error { get; init; }

    public static AuthWorkflowResult<T> Success(T value)
    {
        return new AuthWorkflowResult<T> { Status = AuthWorkflowStatus.Success, Value = value };
    }

    public static AuthWorkflowResult<T> BadRequest(string error)
    {
        return new AuthWorkflowResult<T> { Status = AuthWorkflowStatus.BadRequest, Error = error };
    }

    public static AuthWorkflowResult<T> Unauthorized(string? error = null)
    {
        return new AuthWorkflowResult<T> { Status = AuthWorkflowStatus.Unauthorized, Error = error };
    }

    public static AuthWorkflowResult<T> Forbidden(string error)
    {
        return new AuthWorkflowResult<T> { Status = AuthWorkflowStatus.Forbidden, Error = error };
    }

    public static AuthWorkflowResult<T> Locked(string error)
    {
        return new AuthWorkflowResult<T> { Status = AuthWorkflowStatus.Locked, Error = error };
    }

    public static AuthWorkflowResult<T> ServerError(string error)
    {
        return new AuthWorkflowResult<T> { Status = AuthWorkflowStatus.ServerError, Error = error };
    }
}

public sealed class AuthMessagePayload
{
    public string Message { get; init; } = string.Empty;
    public string? Link { get; init; }
}

public class AuthWorkflowService
{
    private readonly AuthAccountFlowService _accountFlow;
    private readonly AuthProfileService _profileService;
    private readonly AuthSocialService _authSocialService;
    private readonly AuthEmailService _authEmailService;

    public AuthWorkflowService(
        AuthAccountFlowService accountFlow,
        AuthProfileService profileService,
        AuthSocialService authSocialService,
        AuthEmailService authEmailService)
    {
        _accountFlow = accountFlow;
        _profileService = profileService;
        _authSocialService = authSocialService;
        _authEmailService = authEmailService;
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> RegisterAsync(RegisterRequest request)
    {
        return await _accountFlow.RegisterAsync(request);
    }

    public async Task<AuthWorkflowResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        return await _accountFlow.LoginAsync(request);
    }

    public async Task<AuthWorkflowResult<AuthResponse>> GoogleLoginAsync(GoogleLoginRequest request)
    {
        return await _authSocialService.GoogleLoginAsync(request);
    }

    public async Task<AuthWorkflowResult<AuthResponse>> FacebookLoginAsync(FacebookLoginRequest request)
    {
        return await _authSocialService.FacebookLoginAsync(request);
    }

    public async Task<AuthWorkflowResult<UserDto>> MeAsync(ClaimsPrincipal principal)
    {
        return await _profileService.MeAsync(principal);
    }

    public async Task<AuthWorkflowResult<UserDto>> UpdateMeAsync(ClaimsPrincipal principal, UpdateProfileRequest request)
    {
        return await _profileService.UpdateMeAsync(principal, request);
    }

    public async Task<AuthWorkflowResult<object?>> ChangePasswordAsync(ClaimsPrincipal principal, ChangePasswordRequest request)
    {
        return await _profileService.ChangePasswordAsync(principal, request);
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        return await _authEmailService.ForgotPasswordAsync(request);
    }

    public async Task<AuthWorkflowResult<object?>> ResetPasswordAsync(ResetPasswordRequest request)
    {
        return await _authEmailService.ResetPasswordAsync(request);
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ConfirmEmailAsync(ConfirmEmailRequest request)
    {
        return await _authEmailService.ConfirmEmailAsync(request);
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ResendConfirmationAsync(ResendConfirmationRequest request)
    {
        return await _authEmailService.ResendConfirmationAsync(request);
    }
}
