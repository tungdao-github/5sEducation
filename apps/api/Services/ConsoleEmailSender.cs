using Microsoft.Extensions.Logging;

namespace UdemyClone.Api.Services;

public class ConsoleEmailSender : IEmailSender
{
    private readonly ILogger<ConsoleEmailSender> _logger;

    public ConsoleEmailSender(ILogger<ConsoleEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        _logger.LogInformation(
            "Email to {Email}\nSubject: {Subject}\nBody:\n{Body}",
            toEmail,
            subject,
            htmlBody);
        return Task.CompletedTask;
    }
}
