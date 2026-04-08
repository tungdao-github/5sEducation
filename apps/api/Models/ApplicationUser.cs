using Microsoft.AspNetCore.Identity;

namespace UdemyClone.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int LoyaltyPoints { get; set; }
    public string LoyaltyTier { get; set; } = "Bronze";
    public DateTime? LoyaltyUpdatedAt { get; set; }
}
