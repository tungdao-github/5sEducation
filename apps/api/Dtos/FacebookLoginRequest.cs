using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class FacebookLoginRequest
{
    [Required]
    public string AccessToken { get; set; } = string.Empty;
}
