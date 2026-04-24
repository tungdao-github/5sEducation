using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class SupportReplyService
{
    private readonly ISupportRepository _repository;
    private readonly SupportNotificationService _notifications;

    public SupportReplyService(ISupportRepository repository, SupportNotificationService notifications)
    {
        _repository = repository;
        _notifications = notifications;
    }

    public async Task<SupportMutationResult<List<SupportReplyDto>>> ListRepliesAsync(
        int id,
        string? userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var message = await _repository.FindMessageAsync(id, tracked: false, cancellationToken);
        if (message is null)
        {
            return SupportMutationResult<List<SupportReplyDto>>.NotFound();
        }

        if (!isAdmin && message.UserId != userId)
        {
            return SupportMutationResult<List<SupportReplyDto>>.Forbidden();
        }

        var replies = await _repository.ListRepliesAsync(id, cancellationToken);
        return SupportMutationResult<List<SupportReplyDto>>.Success(replies);
    }

    public async Task<SupportMutationResult<SupportReplyDto>> AddReplyAsync(
        int id,
        string? userId,
        bool isAdmin,
        SupportReplyCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var message = await _repository.FindMessageAsync(id, tracked: true, cancellationToken);
        if (message is null)
        {
            return SupportMutationResult<SupportReplyDto>.NotFound();
        }

        if (!isAdmin && message.UserId != userId)
        {
            return SupportMutationResult<SupportReplyDto>.Forbidden();
        }

        var authorName = "User";
        if (isAdmin)
        {
            authorName = "Admin";
        }
        else if (!string.IsNullOrWhiteSpace(userId))
        {
            var user = await _repository.FindUserAsync(userId, cancellationToken);
            if (user != null)
            {
                authorName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(authorName))
                {
                    authorName = user.Email ?? "User";
                }
            }
        }

        var reply = new SupportReply
        {
            SupportMessageId = message.Id,
            AuthorRole = isAdmin ? "admin" : "user",
            AuthorName = authorName,
            Message = request.Message.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddReplyAsync(reply, cancellationToken);
        message.Status = isAdmin ? "answered" : "open";
        message.UpdatedAt = DateTime.UtcNow;
        await _repository.SaveChangesAsync(cancellationToken);

        var replyDto = new SupportReplyDto
        {
            Id = reply.Id,
            SupportMessageId = reply.SupportMessageId,
            AuthorRole = reply.AuthorRole,
            AuthorName = reply.AuthorName,
            Message = reply.Message,
            CreatedAt = reply.CreatedAt
        };

        await _notifications.NotifyNewReplyAsync(message, replyDto, cancellationToken);
        return SupportMutationResult<SupportReplyDto>.Success(replyDto);
    }
}
