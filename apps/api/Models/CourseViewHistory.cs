namespace UdemyClone.Api.Models;

public class CourseViewHistory
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public int CourseId { get; set; }

    public DateTime ViewedAt { get; set; }

    public ApplicationUser? User { get; set; }

    public Course? Course { get; set; }
}
