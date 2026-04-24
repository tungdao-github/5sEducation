using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class AuthEmailService
{
    private readonly AuthPasswordRecoveryService _passwordRecoveryService;
    private readonly AuthEmailConfirmationService _confirmationService;

    public AuthEmailService(
        AuthPasswordRecoveryService passwordRecoveryService,
        AuthEmailConfirmationService confirmationService)
    {
        _passwordRecoveryService = passwordRecoveryService;
        _confirmationService = confirmationService;
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        return await _passwordRecoveryService.ForgotPasswordAsync(request);
    }

    public async Task<AuthWorkflowResult<object?>> ResetPasswordAsync(ResetPasswordRequest request)
    {
        return await _passwordRecoveryService.ResetPasswordAsync(request);
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ConfirmEmailAsync(ConfirmEmailRequest request)
    {
        return await _confirmationService.ConfirmEmailAsync(request);
    }

    public async Task<AuthWorkflowResult<AuthMessagePayload>> ResendConfirmationAsync(ResendConfirmationRequest request)
    {
        return await _confirmationService.ResendConfirmationAsync(request);
    }
}
