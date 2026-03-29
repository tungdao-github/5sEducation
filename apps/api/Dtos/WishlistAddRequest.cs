using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class WishlistAddRequest
{
    [Required, Range(1, int.MaxValue)]
    public int CourseId { get; set; }
}
