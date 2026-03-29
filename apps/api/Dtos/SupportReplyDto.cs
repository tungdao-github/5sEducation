namespace UdemyClone.Api.Dtos;

public class SupportReplyDto
{
    public int Id { get; set; }
    public int SupportMessageId { get; set; }
    public string AuthorRole { get; set; } = "user";
    public string AuthorName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
