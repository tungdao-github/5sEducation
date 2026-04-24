using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = "Admin")]
public class AdminStatsController : ControllerBase
{
    private readonly AdminStatsService _stats;

    public AdminStatsController(AdminStatsService stats)
    {
        _stats = stats;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<AdminStatsOverviewDto>> GetOverview()
    {
        return Ok(await _stats.GetOverviewAsync());
    }
}
