using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class SystemSetting
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Key { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Value { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Group { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Description { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
