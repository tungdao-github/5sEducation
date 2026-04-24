using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly UserOrdersService _orders;

    public OrdersController(UserOrdersService orders)
    {
        _orders = orders;
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<OrderDto>>> MyOrders()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        return Ok(await _orders.GetMineAsync(userId));
    }
}
