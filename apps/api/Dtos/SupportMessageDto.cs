namespace UdemyClone.Api.Dtos;

public class SupportMessageDto
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public string? UserEmail { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "open";
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
