using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public class AuthPasswordRecoveryService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;
    private readonly FrontendOptions _frontendOptions;
    private readonly IWebHostEnvironment _environment;

    public AuthPasswordRecoveryService(
        UserManager<ApplicationUser> userManager,
        IEmailSender emailSender,
        IOptions<FrontendOptions> frontendOptions,
        IWebHostEnvironment environment)
    {
        _userManager = userManager;
        _emailSender = emailSender;
        _frontendOptions = frontendOptions.Value;
        _environment = environment;
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return AuthWorkflowResult<AuthMessagePayload>.BadRequest("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ResetUrl))
        {
            return AuthWorkflowResult<AuthMessagePayload>.BadRequest("Reset URL is required.");
        }

        if (string.IsNullOrWhiteSpace(_frontendOptions.BaseUrl))
        {
            return AuthWorkflowResult<AuthMessagePayload>.ServerError("Frontend base URL is not configured.");
        }

        if (!AuthAccountService.TryBuildResetUri(request.ResetUrl, _frontendOptions.BaseUrl, out var resetUri, out var resetError))
        {
            return AuthWorkflowResult<AuthMessagePayload>.BadRequest(resetError);
        }

        string? resetLink = null;
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user != null)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            resetLink = AuthAccountService.BuildResetLink(resetUri, user.Email ?? string.Empty, encodedToken);

            await _emailSender.SendAsync(
                user.Email ?? request.Email,
                "Reset your password",
                $"Use this link to reset your password: {resetLink}");
        }

        return AuthWorkflowResult<AuthMessagePayload>.Success(new AuthMessagePayload
        {
            Message = user != null && _environment.IsDevelopment()
                ? "Reset link generated."
                : "If the email exists, a reset link was sent.",
            Link = user != null && _environment.IsDevelopment() ? resetLink : null
        });
    }

    public async Task<AuthWorkflowResult<object?>> ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token))
        {
            return AuthWorkflowResult<object?>.BadRequest("Invalid reset request.");
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return AuthWorkflowResult<object?>.BadRequest("Invalid reset token.");
        }

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch
        {
            return AuthWorkflowResult<object?>.BadRequest("Invalid reset token.");
        }

        var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);
        return result.Succeeded
            ? AuthWorkflowResult<object?>.Success(null)
            : AuthWorkflowResult<object?>.BadRequest(string.Join(", ", result.Errors.Select(error => error.Description)));
    }
}
