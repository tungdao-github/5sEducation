using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class ResendConfirmationRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;
}
