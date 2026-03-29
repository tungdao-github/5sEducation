namespace UdemyClone.Api.Services;

public class CloudflareStreamOptions
{
    public string AccountId { get; set; } = string.Empty;
    public string ApiToken { get; set; } = string.Empty;
    public string CustomerCode { get; set; } = string.Empty;
    public int MaxDurationSeconds { get; set; } = 3600;
}
