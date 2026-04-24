using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminAuditLogsRepository
{
    Task AddAsync(AdminAuditLog log, CancellationToken cancellationToken = default);

    Task<List<AdminAuditLogDto>> GetAllAsync(
        string? query,
        string? userId,
        DateTime? from,
        DateTime? to,
        int take,
        CancellationToken cancellationToken = default);
}

public sealed class AdminAuditLogsRepository : IAdminAuditLogsRepository
{
    private readonly ApplicationDbContext _db;

    public AdminAuditLogsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(AdminAuditLog log, CancellationToken cancellationToken = default)
    {
        _db.AdminAuditLogs.Add(log);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<AdminAuditLogDto>> GetAllAsync(
        string? query,
        string? userId,
        DateTime? from,
        DateTime? to,
        int take,
        CancellationToken cancellationToken = default)
    {
        var logsQuery = _db.AdminAuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(userId))
        {
            logsQuery = logsQuery.Where(l => l.UserId == userId);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = $"%{query.Trim()}%";
            logsQuery = logsQuery.Where(l =>
                EF.Functions.Like(l.UserEmail, q)
                || EF.Functions.Like(l.Action, q)
                || EF.Functions.Like(l.Path, q)
                || EF.Functions.Like(l.Method, q));
        }

        if (from.HasValue)
        {
            logsQuery = logsQuery.Where(l => l.CreatedAt >= from.Value);
        }

        if (to.HasValue)
        {
            logsQuery = logsQuery.Where(l => l.CreatedAt <= to.Value);
        }

        return await logsQuery
            .OrderByDescending(l => l.CreatedAt)
            .Take(take)
            .Select(l => new AdminAuditLogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                UserEmail = l.UserEmail,
                Action = l.Action,
                Method = l.Method,
                Path = l.Path,
                QueryString = l.QueryString,
                StatusCode = l.StatusCode,
                IpAddress = l.IpAddress,
                UserAgent = l.UserAgent,
                DurationMs = l.DurationMs,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
