using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class ResetPasswordRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(2048)]
    public string Token { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(128)]
    public string NewPassword { get; set; } = string.Empty;
}
