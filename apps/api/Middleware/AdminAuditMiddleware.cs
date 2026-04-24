using System.Diagnostics;
using System.Security.Claims;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Middleware;

public class AdminAuditMiddleware
{
    private readonly RequestDelegate _next;

    public AdminAuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        var isAdminRoute = path.StartsWith("/api/admin", StringComparison.OrdinalIgnoreCase);
        var skipLogging = path.StartsWith("/api/admin/audit-logs", StringComparison.OrdinalIgnoreCase);

        if (!isAdminRoute || skipLogging)
        {
            await _next(context);
            return;
        }

        var user = context.User;
        if (user?.Identity?.IsAuthenticated != true || !user.IsInRole("Admin"))
        {
            await _next(context);
            return;
        }

        var stopwatch = Stopwatch.StartNew();

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            var email = user.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
            var action = $"{context.Request.Method} {path}";
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = context.Request.Headers.UserAgent.ToString();
            var queryString = context.Request.QueryString.Value ?? string.Empty;

            try
            {
                var repository = context.RequestServices.GetRequiredService<IAdminAuditLogsRepository>();
                await repository.AddAsync(new AdminAuditLog
                {
                    UserId = userId,
                    UserEmail = email,
                    Action = action,
                    Method = context.Request.Method ?? string.Empty,
                    Path = path,
                    QueryString = queryString,
                    StatusCode = context.Response.StatusCode,
                    IpAddress = ip,
                    UserAgent = userAgent,
                    DurationMs = stopwatch.ElapsedMilliseconds,
                    CreatedAt = DateTime.UtcNow
                });
            }
            catch
            {
                // Ignore audit failures to avoid breaking admin requests.
            }
        }
    }
}
