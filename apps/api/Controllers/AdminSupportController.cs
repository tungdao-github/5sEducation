using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/support/messages")]
[Authorize(Roles = "Admin")]
public class AdminSupportController : ControllerBase
{
    private readonly AdminSupportService _support;

    public AdminSupportController(AdminSupportService support)
    {
        _support = support;
    }

    [HttpGet]
    public async Task<ActionResult<List<SupportMessageDto>>> List([FromQuery] string? status)
    {
        return Ok(await _support.GetAllAsync(status));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SupportMessageDto>> Update(int id, SupportMessageAdminUpdateRequest request)
    {
        var result = await _support.UpdateAsync(id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            _ => Problem("Unable to update support message.")
        };
    }
}
