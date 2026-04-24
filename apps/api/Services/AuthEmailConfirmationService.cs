using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public class AuthEmailConfirmationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;
    private readonly FrontendOptions _frontendOptions;
    private readonly IWebHostEnvironment _environment;

    public AuthEmailConfirmationService(
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

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ConfirmEmailAsync(ConfirmEmailRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.Token))
        {
            return AuthWorkflowResult<AuthMessagePayload>.BadRequest("Invalid confirmation request.");
        }

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user is null)
        {
            return AuthWorkflowResult<AuthMessagePayload>.BadRequest("Invalid confirmation token.");
        }

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch
        {
            return AuthWorkflowResult<AuthMessagePayload>.BadRequest("Invalid confirmation token.");
        }

        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
        return result.Succeeded
            ? AuthWorkflowResult<AuthMessagePayload>.Success(new AuthMessagePayload { Message = "Email confirmed." })
            : AuthWorkflowResult<AuthMessagePayload>.BadRequest(string.Join(", ", result.Errors.Select(error => error.Description)));
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ResendConfirmationAsync(ResendConfirmationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return AuthWorkflowResult<AuthMessagePayload>.BadRequest("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(_frontendOptions.BaseUrl))
        {
            return AuthWorkflowResult<AuthMessagePayload>.ServerError("Frontend base URL is not configured.");
        }

        if (!Uri.TryCreate(_frontendOptions.BaseUrl.Trim(), UriKind.Absolute, out var baseUri))
        {
            return AuthWorkflowResult<AuthMessagePayload>.ServerError("Frontend base URL is invalid.");
        }

        string? confirmLink = null;
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user != null && !user.EmailConfirmed)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            confirmLink = AuthAccountService.BuildConfirmLink(baseUri, user.Id, encodedToken);

            await _emailSender.SendAsync(
                user.Email ?? request.Email,
                "Confirm your email",
                $"Confirm your email by clicking this link: {confirmLink}");
        }

        return AuthWorkflowResult<AuthMessagePayload>.Success(new AuthMessagePayload
        {
            Message = user != null && !user.EmailConfirmed && _environment.IsDevelopment()
                ? "Confirmation email sent."
                : "If the email exists, a confirmation link was sent.",
            Link = user != null && !user.EmailConfirmed && _environment.IsDevelopment() ? confirmLink : null
        });
    }
}
