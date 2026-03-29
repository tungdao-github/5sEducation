using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class ChangePasswordRequest
{
    [Required, MinLength(6), MaxLength(128)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(128)]
    public string NewPassword { get; set; } = string.Empty;
}
