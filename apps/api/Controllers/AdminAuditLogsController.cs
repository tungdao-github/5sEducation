using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize(Roles = "Admin")]
public class AdminAuditLogsController : ControllerBase
{
    private readonly AdminAuditLogsService _logs;

    public AdminAuditLogsController(AdminAuditLogsService logs)
    {
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminAuditLogDto>>> GetAll(
        [FromQuery] string? query,
        [FromQuery] string? userId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int take = 80)
    {
        return Ok(await _logs.GetAllAsync(query, userId, from, to, take));
    }
}
