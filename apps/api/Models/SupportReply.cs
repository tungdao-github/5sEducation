namespace UdemyClone.Api.Models;

public class SupportReply
{
    public int Id { get; set; }
    public int SupportMessageId { get; set; }
    public SupportMessage? SupportMessage { get; set; }
    public string AuthorRole { get; set; } = "user";
    public string AuthorName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
