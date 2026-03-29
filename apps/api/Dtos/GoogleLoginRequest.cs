using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class GoogleLoginRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
