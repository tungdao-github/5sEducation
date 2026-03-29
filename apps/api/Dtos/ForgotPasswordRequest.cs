using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class ForgotPasswordRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, Url, MaxLength(2048)]
    public string ResetUrl { get; set; } = string.Empty;
}
