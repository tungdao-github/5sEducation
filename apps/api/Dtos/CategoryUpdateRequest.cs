using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class CategoryUpdateRequest
{
    [Required, MaxLength(50)]
    public string Title { get; set; } = string.Empty;
}
