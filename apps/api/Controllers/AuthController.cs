using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly AuthWorkflowService _workflow;

    public AuthController(AuthWorkflowService workflow)
    {
        _workflow = workflow;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterRequest request)
    {
        return ToActionResult(await _workflow.RegisterAsync(request));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        return ToActionResult(await _workflow.LoginAsync(request));
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin(GoogleLoginRequest request)
    {
        return ToActionResult(await _workflow.GoogleLoginAsync(request));
    }

    [HttpPost("facebook")]
    public async Task<ActionResult<AuthResponse>> FacebookLogin(FacebookLoginRequest request)
    {
        return ToActionResult(await _workflow.FacebookLoginAsync(request));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        return ToActionResult(await _workflow.MeAsync(User));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateMe(UpdateProfileRequest request)
    {
        return ToActionResult(await _workflow.UpdateMeAsync(User, request));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordRequest request)
    {
        return ToActionResult(await _workflow.ChangePasswordAsync(User, request), successWithoutPayload: true);
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        return ToActionResult(await _workflow.ForgotPasswordAsync(request));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordRequest request)
    {
        return ToActionResult(await _workflow.ResetPasswordAsync(request), successWithoutPayload: true);
    }

    [HttpPost("confirm-email")]
    public async Task<ActionResult> ConfirmEmail(ConfirmEmailRequest request)
    {
        return ToActionResult(await _workflow.ConfirmEmailAsync(request));
    }

    [HttpPost("resend-confirmation")]
    public async Task<ActionResult> ResendConfirmation(ResendConfirmationRequest request)
    {
        return ToActionResult(await _workflow.ResendConfirmationAsync(request));
    }

    private ActionResult ToActionResult<T>(AuthWorkflowResult<T> result, bool successWithoutPayload = false)
    {
        return result.Status switch
        {
            AuthWorkflowStatus.Success => successWithoutPayload || result.Value is null ? Ok() : Ok(result.Value),
            AuthWorkflowStatus.BadRequest => BadRequest(result.Error),
            AuthWorkflowStatus.Unauthorized => string.IsNullOrWhiteSpace(result.Error) ? Unauthorized() : Unauthorized(result.Error),
            AuthWorkflowStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, result.Error),
            AuthWorkflowStatus.Locked => StatusCode(StatusCodes.Status423Locked, result.Error),
            AuthWorkflowStatus.ServerError => StatusCode(StatusCodes.Status500InternalServerError, result.Error),
            _ => Problem("Unable to complete auth operation.")
        };
    }
}
