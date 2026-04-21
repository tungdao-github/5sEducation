namespace UdemyClone.Api.Dtos;

public class ReviewDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}
