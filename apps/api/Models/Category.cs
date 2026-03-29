using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class Category
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
