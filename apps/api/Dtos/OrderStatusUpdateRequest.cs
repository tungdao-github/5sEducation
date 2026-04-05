using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class OrderStatusUpdateRequest
{
    [Required, MaxLength(40)]
    public string Status { get; set; } = string.Empty;
}
