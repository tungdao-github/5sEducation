namespace UdemyClone.Api.Models;

public class BlogCommentLike
{
    public int Id { get; set; }

    public int BlogCommentId { get; set; }
    public BlogComment? BlogComment { get; set; }

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
