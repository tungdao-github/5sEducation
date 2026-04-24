using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public enum SupportMutationStatus
{
    Success = 0,
    NotFound = 1,
    Forbidden = 2,
    BadRequest = 3
}

public sealed class SupportMutationResult<T>
{
    public SupportMutationStatus Status { get; init; }

    public string? Error { get; init; }

    public T? Value { get; init; }

    public static SupportMutationResult<T> Success(T value)
    {
        return new SupportMutationResult<T>
        {
            Status = SupportMutationStatus.Success,
            Value = value
        };
    }

    public static SupportMutationResult<T> NotFound(string? error = null)
    {
        return new SupportMutationResult<T>
        {
            Status = SupportMutationStatus.NotFound,
            Error = error
        };
    }

    public static SupportMutationResult<T> Forbidden(string? error = null)
    {
        return new SupportMutationResult<T>
        {
            Status = SupportMutationStatus.Forbidden,
            Error = error
        };
    }

    public static SupportMutationResult<T> BadRequest(string error)
    {
        return new SupportMutationResult<T>
        {
            Status = SupportMutationStatus.BadRequest,
            Error = error
        };
    }
}

public class SupportService
{
    private readonly SupportMessageService _messageService;
    private readonly SupportReplyService _replyService;

    public SupportService(
        SupportMessageService messageService,
        SupportReplyService replyService)
    {
        _messageService = messageService;
        _replyService = replyService;
    }

    public async Task<SupportMutationResult<SupportMessageDto>> CreateAsync(
        string? userId,
        string? emailClaim,
        SupportMessageCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        return await _messageService.CreateAsync(userId, emailClaim, request, cancellationToken);
    }

    public async Task<List<SupportMessageDto>> ListMineAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _messageService.ListMineAsync(userId, cancellationToken);
    }

    public async Task<SupportMutationResult<List<SupportReplyDto>>> ListRepliesAsync(
        int id,
        string? userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        return await _replyService.ListRepliesAsync(id, userId, isAdmin, cancellationToken);
    }

    public async Task<SupportMutationResult<SupportReplyDto>> AddReplyAsync(
        int id,
        string? userId,
        bool isAdmin,
        SupportReplyCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        return await _replyService.AddReplyAsync(id, userId, isAdmin, request, cancellationToken);
    }
}
