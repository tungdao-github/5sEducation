using Google.Apis.Auth;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly GoogleAuthOptions _googleAuthOptions;
    private readonly FrontendOptions _frontendOptions;
    private readonly ILogger<AuthController> _logger;
    private readonly IEmailSender _emailSender;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        TokenService tokenService,
        IOptions<GoogleAuthOptions> googleAuthOptions,
        IOptions<FrontendOptions> frontendOptions,
        ILogger<AuthController> logger,
        IEmailSender emailSender,
        IWebHostEnvironment environment)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _googleAuthOptions = googleAuthOptions.Value;
        _frontendOptions = frontendOptions.Value;
        _logger = logger;
        _emailSender = emailSender;
        _environment = environment;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        await _userManager.AddToRoleAsync(user, "User");

        if (string.IsNullOrWhiteSpace(_frontendOptions.BaseUrl))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Frontend base URL is not configured.");
        }

        if (!Uri.TryCreate(_frontendOptions.BaseUrl.Trim(), UriKind.Absolute, out var baseUri))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Frontend base URL is invalid.");
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var confirmLink = BuildConfirmLink(baseUri, user.Id, encodedToken);

        await _emailSender.SendAsync(
            user.Email ?? request.Email,
            "Confirm your email",
            $"Confirm your email by clicking this link: {confirmLink}");

        if (_environment.IsDevelopment())
        {
            return Ok(new { message = "Account created. Please confirm your email.", confirmLink });
        }

        return Ok(new { message = "Account created. Please confirm your email." });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized();
        }

        if (!user.EmailConfirmed)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Email not confirmed.");
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            return StatusCode(StatusCodes.Status423Locked, "Account is temporarily locked. Try again later.");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return StatusCode(StatusCodes.Status423Locked, "Account is temporarily locked. Try again later.");
            }
            return Unauthorized();
        }

        return Ok(await BuildAuthResponseAsync(user));
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin(GoogleLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(_googleAuthOptions.ClientId))
        {
            return BadRequest("Google sign-in is not configured.");
        }

        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return BadRequest("Google token is required.");
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_googleAuthOptions.ClientId]
            };

            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, validationSettings);
        }
        catch (InvalidJwtException)
        {
            return Unauthorized("Invalid Google token.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google sign-in failed.");
            return BadRequest("Google authentication failed.");
        }

        if (string.IsNullOrWhiteSpace(payload.Email))
        {
            return Unauthorized("Google account has no email.");
        }

        var user = await _userManager.FindByEmailAsync(payload.Email);
        if (user is null)
        {
            var firstName = payload.GivenName;
            var lastName = payload.FamilyName;

            if (string.IsNullOrWhiteSpace(firstName) && !string.IsNullOrWhiteSpace(payload.Name))
            {
                var parts = payload.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                firstName = parts.FirstOrDefault() ?? "Google";
                lastName = parts.Length > 1 ? string.Join(' ', parts.Skip(1)) : firstName;
            }

            if (string.IsNullOrWhiteSpace(firstName))
            {
                firstName = "Google";
            }

            if (string.IsNullOrWhiteSpace(lastName))
            {
                lastName = firstName;
            }

            user = new ApplicationUser
            {
                UserName = payload.Email,
                Email = payload.Email,
                EmailConfirmed = payload.EmailVerified,
                FirstName = firstName,
                LastName = lastName,
                AvatarUrl = payload.Picture,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return BadRequest(createResult.Errors.Select(e => e.Description));
            }

            await _userManager.AddToRoleAsync(user, "User");
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
                await _userManager.UpdateAsync(user);
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count == 0)
            {
                await _userManager.AddToRoleAsync(user, "User");
            }
        }

        return Ok(await BuildAuthResponseAsync(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(await BuildUserDtoAsync(user));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateMe(UpdateProfileRequest request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        if (request.FirstName is not null)
        {
            user.FirstName = request.FirstName.Trim();
        }

        if (request.LastName is not null)
        {
            user.LastName = request.LastName.Trim();
        }

        if (request.AvatarUrl is not null)
        {
            user.AvatarUrl = request.AvatarUrl.Trim();
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        return Ok(await BuildUserDtoAsync(user));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        return Ok();
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ResetUrl))
        {
            return BadRequest("Reset URL is required.");
        }

        if (string.IsNullOrWhiteSpace(_frontendOptions.BaseUrl))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Frontend base URL is not configured.");
        }

        if (!TryBuildResetUri(request.ResetUrl, _frontendOptions.BaseUrl, out var resetUri, out var resetError))
        {
            return BadRequest(resetError);
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user != null)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var resetLink = BuildResetLink(resetUri, user.Email ?? string.Empty, encodedToken);

            await _emailSender.SendAsync(
                user.Email ?? request.Email,
                "Reset your password",
                $"Use this link to reset your password: {resetLink}");

            if (_environment.IsDevelopment())
            {
                return Ok(new { message = "Reset link generated.", resetLink });
            }
        }

        return Ok(new { message = "If the email exists, a reset link was sent." });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token))
        {
            return BadRequest("Invalid reset request.");
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return BadRequest("Invalid reset token.");
        }

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch
        {
            return BadRequest("Invalid reset token.");
        }

        var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        return Ok();
    }

    [HttpPost("confirm-email")]
    public async Task<ActionResult> ConfirmEmail(ConfirmEmailRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.Token))
        {
            return BadRequest("Invalid confirmation request.");
        }

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user is null)
        {
            return BadRequest("Invalid confirmation token.");
        }

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch
        {
            return BadRequest("Invalid confirmation token.");
        }

        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        return Ok(new { message = "Email confirmed." });
    }

    [HttpPost("resend-confirmation")]
    public async Task<ActionResult> ResendConfirmation(ResendConfirmationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(_frontendOptions.BaseUrl))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Frontend base URL is not configured.");
        }

        if (!Uri.TryCreate(_frontendOptions.BaseUrl.Trim(), UriKind.Absolute, out var baseUri))
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Frontend base URL is invalid.");
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user != null && !user.EmailConfirmed)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var confirmLink = BuildConfirmLink(baseUri, user.Id, encodedToken);

            await _emailSender.SendAsync(
                user.Email ?? request.Email,
                "Confirm your email",
                $"Confirm your email by clicking this link: {confirmLink}");

            if (_environment.IsDevelopment())
            {
                return Ok(new { message = "Confirmation email sent.", confirmLink });
            }
        }

        return Ok(new { message = "If the email exists, a confirmation link was sent." });
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var (token, expiresAt) = _tokenService.CreateToken(user, roles);

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = BuildUserDto(user, roles)
        };
    }

    private async Task<UserDto> BuildUserDtoAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return BuildUserDto(user, roles);
    }

    private static UserDto BuildUserDto(ApplicationUser user, IList<string> roles)
    {
        return new UserDto
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
        };
    }

    private static bool TryBuildResetUri(string resetUrl, string baseUrl, out Uri resetUri, out string error)
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

    private static string BuildResetLink(Uri resetUri, string email, string encodedToken)
    {
        var builder = new UriBuilder(resetUri)
        {
            Query = $"email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(encodedToken)}"
        };

        return builder.Uri.ToString();
    }

    private static string BuildConfirmLink(Uri baseUri, string userId, string encodedToken)
    {
        var confirmUri = new Uri(baseUri, "/confirm-email");
        var builder = new UriBuilder(confirmUri)
        {
            Query = $"userId={Uri.EscapeDataString(userId)}&token={Uri.EscapeDataString(encodedToken)}"
        };

        return builder.Uri.ToString();
    }
}
