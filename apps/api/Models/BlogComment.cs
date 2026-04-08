using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Models;

public class BlogComment
{
    public int Id { get; set; }

    public int BlogPostId { get; set; }
    public BlogPost? BlogPost { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    [Required, MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public int LikeCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BlogCommentLike> Likes { get; set; } = new List<BlogCommentLike>();
}
