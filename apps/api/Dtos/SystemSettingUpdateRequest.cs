using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class SystemSettingUpdateRequest
{
    [MaxLength(2000)]
    public string Value { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Group { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Description { get; set; }
}
