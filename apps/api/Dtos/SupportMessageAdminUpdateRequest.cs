using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class SupportMessageAdminUpdateRequest
{
    [MaxLength(20)]
    public string? Status { get; set; }

    [MaxLength(1000)]
    public string? AdminNote { get; set; }
}
