using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class SupportReplyCreateRequest
{
    [Required, MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}
