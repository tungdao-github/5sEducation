using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly AdminOrdersService _orders;

    public AdminOrdersController(AdminOrdersService orders)
    {
        _orders = orders;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderAdminDto>>> GetAll([FromQuery] string? status)
    {
        return Ok(await _orders.GetAllAsync(status));
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, OrderStatusUpdateRequest request)
    {
        var result = await _orders.UpdateStatusAsync(id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to update order.")
        };
    }
}
