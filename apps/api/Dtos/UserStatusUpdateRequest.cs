using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class UserStatusUpdateRequest
{
    [Required]
    public bool IsLocked { get; set; }
}
