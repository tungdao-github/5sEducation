using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class UserAddressUpdateRequest
{
    [MaxLength(120)]
    public string Label { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string RecipientName { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Line1 { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Line2 { get; set; }

    [Required, MaxLength(120)]
    public string City { get; set; } = string.Empty;

    [MaxLength(120)]
    public string State { get; set; } = string.Empty;

    [MaxLength(30)]
    public string PostalCode { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Country { get; set; } = "Vietnam";

    public bool IsDefault { get; set; }
}
