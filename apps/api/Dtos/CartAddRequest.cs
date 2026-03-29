using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class CartAddRequest
{
    [Required, Range(1, int.MaxValue)]
    public int CourseId { get; set; }

    [Range(1, 20)]
    public int Quantity { get; set; } = 1;
}
