using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class OrderItem
{
    public int Id { get; set; }

    [Required]
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    [Required]
    public int CourseId { get; set; }

    [Required]
    public string CourseTitle { get; set; } = string.Empty;

    [Required]
    public string CourseSlug { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}
