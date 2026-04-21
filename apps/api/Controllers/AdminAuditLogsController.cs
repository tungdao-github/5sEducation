using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize(Roles = "Admin")]
public class AdminAuditLogsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminAuditLogsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminAuditLogDto>>> GetAll(
        [FromQuery] string? query,
        [FromQuery] string? userId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int take = 80)
    {
        var normalizedTake = Math.Clamp(take, 1, 200);
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

        var logs = await logsQuery
            .OrderByDescending(l => l.CreatedAt)
            .Take(normalizedTake)
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
            .ToListAsync();

        return Ok(logs);
    }
}
