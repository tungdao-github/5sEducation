using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class UserRolesUpdateRequest
{
    [Required]
    public List<string> Roles { get; set; } = new();
}
