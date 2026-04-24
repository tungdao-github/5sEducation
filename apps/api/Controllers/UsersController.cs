using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AdminUsersService _users;

    public UsersController(AdminUsersService users)
    {
        _users = users;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        return Ok(await _users.GetAllAsync());
    }

    [HttpGet("roles")]
    public async Task<ActionResult<List<string>>> GetRoles()
    {
        return Ok(await _users.GetRolesAsync());
    }

    [HttpPut("{id}/roles")]
    public async Task<IActionResult> UpdateRoles(string id, UserRolesUpdateRequest request)
    {
        var result = await _users.UpdateRolesAsync(id, request.Roles);
        return result.Status switch
        {
            AdminUserMutationStatus.Success => NoContent(),
            AdminUserMutationStatus.NotFound => NotFound(),
            AdminUserMutationStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to update user roles.")
        };
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, UserStatusUpdateRequest request)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _users.UpdateStatusAsync(id, request.IsLocked, currentUserId);
        return result.Status switch
        {
            AdminUserMutationStatus.Success => NoContent(),
            AdminUserMutationStatus.NotFound => NotFound(),
            AdminUserMutationStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to update user status.")
        };
    }
}
