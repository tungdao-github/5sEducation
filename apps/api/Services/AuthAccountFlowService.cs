using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public class AuthAccountFlowService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly AuthAccountService _authAccountService;
    private readonly IWebHostEnvironment _environment;

    public AuthAccountFlowService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        AuthAccountService authAccountService,
        IWebHostEnvironment environment)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _authAccountService = authAccountService;
        _environment = environment;
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> RegisterAsync(RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return AuthWorkflowResult<AuthMessagePayload>.BadRequest(JoinErrors(createResult));
        }

        await EnsureUserRoleAsync(user);

        var confirmLink = await BuildConfirmLinkAsync(user);
        if (confirmLink is null)
        {
            return AuthWorkflowResult<AuthMessagePayload>.ServerError("Frontend base URL is not configured.");
        }

        return AuthWorkflowResult<AuthMessagePayload>.Success(new AuthMessagePayload
        {
            Message = "Account created. Please confirm your email.",
            Link = _environment.IsDevelopment() ? confirmLink : null
        });
    }

    public async Task<AuthWorkflowResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return AuthWorkflowResult<AuthResponse>.Unauthorized();
        }

        if (!user.EmailConfirmed)
        {
            return AuthWorkflowResult<AuthResponse>.Forbidden("Email not confirmed.");
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            return AuthWorkflowResult<AuthResponse>.Locked("Account is temporarily locked. Try again later.");
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!signInResult.Succeeded)
        {
            return signInResult.IsLockedOut
                ? AuthWorkflowResult<AuthResponse>.Locked("Account is temporarily locked. Try again later.")
                : AuthWorkflowResult<AuthResponse>.Unauthorized();
        }

        return AuthWorkflowResult<AuthResponse>.Success(await _authAccountService.BuildAuthResponseAsync(user));
    }

    private async Task<string?> BuildConfirmLinkAsync(ApplicationUser user)
    {
        var frontendBaseUrl = string.Empty;
        if (string.IsNullOrWhiteSpace(frontendBaseUrl))
        {
            frontendBaseUrl = Environment.GetEnvironmentVariable("FRONTEND_BASE_URL") ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(frontendBaseUrl) || !Uri.TryCreate(frontendBaseUrl.Trim(), UriKind.Absolute, out var baseUri))
        {
            return null;
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        return AuthAccountService.BuildConfirmLink(baseUri, user.Id, encodedToken);
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
}
