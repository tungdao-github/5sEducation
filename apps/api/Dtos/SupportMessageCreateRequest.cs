using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class SupportMessageCreateRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [EmailAddress, MaxLength(256)]
    public string? Email { get; set; }

    [Required, MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}
