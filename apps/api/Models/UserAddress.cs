using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class UserAddress
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
