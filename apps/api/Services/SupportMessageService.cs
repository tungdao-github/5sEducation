using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class SupportMessageService
{
    private readonly ISupportRepository _repository;
    private readonly SupportNotificationService _notifications;

    public SupportMessageService(ISupportRepository repository, SupportNotificationService notifications)
    {
        _repository = repository;
        _notifications = notifications;
    }

    public async Task<SupportMutationResult<SupportMessageDto>> CreateAsync(
        string? userId,
        string? emailClaim,
        SupportMessageCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return SupportMutationResult<SupportMessageDto>.BadRequest("Message is required.");
        }

        var name = request.Name?.Trim() ?? string.Empty;
        var email = request.Email?.Trim() ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var user = await _repository.FindUserAsync(userId, cancellationToken);
            if (user != null)
            {
                name = $"{user.FirstName} {user.LastName}".Trim();
                email = user.Email ?? emailClaim ?? email;
            }
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return SupportMutationResult<SupportMessageDto>.BadRequest("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            name = email.Split('@')[0];
        }

        var message = new SupportMessage
        {
            UserId = userId,
            Name = name,
            Email = email,
            Message = request.Message.Trim(),
            Status = "open",
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddMessageAsync(message, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var dto = new SupportMessageDto
        {
            Id = message.Id,
            UserId = message.UserId,
            UserEmail = emailClaim,
            Name = message.Name,
            Email = message.Email,
            Message = message.Message,
            Status = message.Status,
            CreatedAt = message.CreatedAt
        };

        await _notifications.NotifyNewMessageAsync(dto, userId, cancellationToken);
        return SupportMutationResult<SupportMessageDto>.Success(dto);
    }

    public Task<List<SupportMessageDto>> ListMineAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _repository.ListMessagesByUserAsync(userId, cancellationToken);
    }
}
