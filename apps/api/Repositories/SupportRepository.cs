using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface ISupportRepository
{
    Task<ApplicationUser?> FindUserAsync(string userId, CancellationToken cancellationToken = default);
    Task AddMessageAsync(SupportMessage message, CancellationToken cancellationToken = default);
    Task<List<SupportMessageDto>> ListMessagesByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<SupportMessage?> FindMessageAsync(int id, bool tracked, CancellationToken cancellationToken = default);
    Task<List<SupportReplyDto>> ListRepliesAsync(int supportMessageId, CancellationToken cancellationToken = default);
    Task AddReplyAsync(SupportReply reply, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class SupportRepository : ISupportRepository
{
    private readonly ApplicationDbContext _db;

    public SupportRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<ApplicationUser?> FindUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(user => user.Id == userId, cancellationToken);
    }

    public Task AddMessageAsync(SupportMessage message, CancellationToken cancellationToken = default)
    {
        _db.SupportMessages.Add(message);
        return Task.CompletedTask;
    }

    public async Task<List<SupportMessageDto>> ListMessagesByUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _db.SupportMessages
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new SupportMessageDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserEmail = m.User != null ? m.User.Email : null,
                Name = m.Name,
                Email = m.Email,
                Message = m.Message,
                Status = m.Status,
                AdminNote = m.AdminNote,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task<SupportMessage?> FindMessageAsync(int id, bool tracked, CancellationToken cancellationToken = default)
    {
        var query = tracked ? _db.SupportMessages : _db.SupportMessages.AsNoTracking();
        return query.FirstOrDefaultAsync(message => message.Id == id, cancellationToken);
    }

    public async Task<List<SupportReplyDto>> ListRepliesAsync(int supportMessageId, CancellationToken cancellationToken = default)
    {
        return await _db.SupportReplies
            .AsNoTracking()
            .Where(r => r.SupportMessageId == supportMessageId)
            .OrderBy(r => r.CreatedAt)
            .Select(r => new SupportReplyDto
            {
                Id = r.Id,
                SupportMessageId = r.SupportMessageId,
                AuthorRole = r.AuthorRole,
                AuthorName = r.AuthorName,
                Message = r.Message,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task AddReplyAsync(SupportReply reply, CancellationToken cancellationToken = default)
    {
        _db.SupportReplies.Add(reply);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
