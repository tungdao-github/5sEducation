namespace UdemyClone.Api.Dtos;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsAdmin { get; set; }
    public bool EmailConfirmed { get; set; }
    public List<string> Roles { get; set; } = new();
    public int LoyaltyPoints { get; set; }
    public string LoyaltyTier { get; set; } = "Bronze";
    public int CourseCount { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; }
}
