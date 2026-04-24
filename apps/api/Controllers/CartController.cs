using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly CartCheckoutService _checkoutService;

    public CartController(CartCheckoutService checkoutService)
    {
        _checkoutService = checkoutService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CartItemDto>>> GetCart()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await _checkoutService.GetCartAsync(userId));
    }

    [HttpPost]
    public async Task<IActionResult> Add(CartAddRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var added = await _checkoutService.AddAsync(userId, request);
        return added ? Ok() : NotFound();
    }

    [HttpDelete("{courseId:int}")]
    public async Task<IActionResult> Remove(int courseId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var removed = await _checkoutService.RemoveAsync(userId, courseId);
        return removed ? NoContent() : NotFound();
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<OrderDto>> Checkout([FromBody] CartCheckoutRequest? request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _checkoutService.CheckoutAsync(userId, request);
        if (!result.Success)
        {
            return BadRequest(result.Error);
        }

        return Ok(result.Order);
    }
}
