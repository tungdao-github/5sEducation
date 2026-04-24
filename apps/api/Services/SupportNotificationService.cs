using Microsoft.AspNetCore.SignalR;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Hubs;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public class SupportNotificationService
{
    private readonly IHubContext<SupportHub> _hub;
    private readonly IEmailSender _emailSender;

    public SupportNotificationService(IHubContext<SupportHub> hub, IEmailSender emailSender)
    {
        _hub = hub;
        _emailSender = emailSender;
    }

    public async Task NotifyNewMessageAsync(SupportMessageDto dto, string? userId, CancellationToken cancellationToken)
    {
        await _hub.Clients.Group(SupportHub.AdminGroup)
            .SendAsync("support:message:new", dto, cancellationToken);

        if (!string.IsNullOrWhiteSpace(userId))
        {
            await _hub.Clients.Group(SupportHub.UserGroup(userId))
                .SendAsync("support:message:new", dto, cancellationToken);
        }
    }

    public async Task NotifyNewReplyAsync(SupportMessage message, SupportReplyDto replyDto, CancellationToken cancellationToken)
    {
        await _hub.Clients.Group(SupportHub.AdminGroup)
            .SendAsync("support:reply:new", replyDto, cancellationToken);

        if (!string.IsNullOrWhiteSpace(message.UserId))
        {
            await _hub.Clients.Group(SupportHub.UserGroup(message.UserId))
                .SendAsync("support:reply:new", replyDto, cancellationToken);
        }

        if (replyDto.AuthorRole == "admin" && !string.IsNullOrWhiteSpace(message.Email))
        {
            await _emailSender.SendAsync(
                message.Email,
                "Support reply",
                $"Admin replied: {replyDto.Message}");
        }
    }
}
