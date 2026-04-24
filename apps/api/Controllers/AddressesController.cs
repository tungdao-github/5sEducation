using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly UserAddressesService _addresses;

    public AddressesController(UserAddressesService addresses)
    {
        _addresses = addresses;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserAddressDto>>> GetAll()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        return Ok(await _addresses.GetAllAsync(userId));
    }

    [HttpPost]
    public async Task<ActionResult<UserAddressDto>> Create(UserAddressCreateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _addresses.CreateAsync(userId, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => CreatedAtAction(nameof(GetAll), new { id = result.Value!.Id }, result.Value),
            AdminCrudStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to create address.")
        };
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UserAddressUpdateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _addresses.UpdateAsync(id, userId, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to update address.")
        };
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _addresses.DeleteAsync(id, userId);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => Problem("Unable to delete address.")
        };
    }
}
