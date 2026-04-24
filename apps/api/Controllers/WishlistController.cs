using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly UserWishlistService _wishlist;

    public WishlistController(UserWishlistService wishlist)
    {
        _wishlist = wishlist;
    }

    [HttpGet]
    public async Task<ActionResult<List<WishlistItemDto>>> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        return Ok(await _wishlist.GetAllAsync(userId));
    }

    [HttpPost]
    public async Task<IActionResult> Add(WishlistAddRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _wishlist.AddAsync(userId, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => Problem("Unable to add wishlist item.")
        };
    }

    [HttpDelete("{courseId:int}")]
    public async Task<IActionResult> Remove(int courseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _wishlist.RemoveAsync(userId, courseId);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => Problem("Unable to remove wishlist item.")
        };
    }
}
