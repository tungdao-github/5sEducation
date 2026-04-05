using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class AdminAuditLog
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [MaxLength(256)]
    public string UserEmail { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Method { get; set; } = string.Empty;

    [MaxLength(260)]
    public string Path { get; set; } = string.Empty;

    [MaxLength(260)]
    public string QueryString { get; set; } = string.Empty;

    public int StatusCode { get; set; }

    [MaxLength(64)]
    public string IpAddress { get; set; } = string.Empty;

    [MaxLength(300)]
    public string UserAgent { get; set; } = string.Empty;

    public long DurationMs { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
