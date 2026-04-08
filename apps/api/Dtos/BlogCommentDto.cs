namespace UdemyClone.Api.Dtos;

public class BlogCommentDto
{
    public int Id { get; set; }
    public int BlogPostId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string? AuthorAvatarUrl { get; set; }
    public string Content { get; set; } = string.Empty;
    public int LikeCount { get; set; }
    public bool IsLikedByUser { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class BlogCommentCreateRequest
{
    public string Content { get; set; } = string.Empty;
}

public class BlogCommentLikeDto
{
    public int CommentId { get; set; }
    public int LikeCount { get; set; }
    public bool IsLiked { get; set; }
}
