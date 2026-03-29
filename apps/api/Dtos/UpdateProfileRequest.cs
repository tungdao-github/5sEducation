using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class UpdateProfileRequest
{
    [MaxLength(100)]
    public string? FirstName { get; set; }
    [MaxLength(100)]
    public string? LastName { get; set; }
    [Url, MaxLength(2048)]
    public string? AvatarUrl { get; set; }
}
