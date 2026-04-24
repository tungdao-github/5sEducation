using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class AuthSocialService
{
    private readonly GoogleAuthService _googleAuthService;
    private readonly FacebookAuthService _facebookAuthService;

    public AuthSocialService(GoogleAuthService googleAuthService, FacebookAuthService facebookAuthService)
    {
        _googleAuthService = googleAuthService;
        _facebookAuthService = facebookAuthService;
    }

    public Task<AuthWorkflowResult<AuthResponse>> GoogleLoginAsync(GoogleLoginRequest request)
    {
        return _googleAuthService.LoginAsync(request);
    }

    public Task<AuthWorkflowResult<AuthResponse>> FacebookLoginAsync(FacebookLoginRequest request)
    {
        return _facebookAuthService.LoginAsync(request);
    }
}
