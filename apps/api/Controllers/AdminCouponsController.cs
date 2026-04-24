using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/coupons")]
[Authorize(Roles = "Admin")]
public class AdminCouponsController : ControllerBase
{
    private readonly AdminCouponsService _coupons;

    public AdminCouponsController(AdminCouponsService coupons)
    {
        _coupons = coupons;
    }

    [HttpGet]
    public async Task<ActionResult<List<CouponDto>>> GetAll([FromQuery] string? search)
    {
        return Ok(await _coupons.GetAllAsync(search));
    }

    [HttpPost]
    public async Task<ActionResult<CouponDto>> Create([FromBody] CouponCreateRequest request)
    {
        var result = await _coupons.CreateAsync(request);
        return result.Status switch
        {
            AdminCrudStatus.Success => CreatedAtAction(nameof(GetAll), new { id = result.Value!.Id }, result.Value),
            AdminCrudStatus.Conflict => Conflict(result.Error),
            _ => BadRequest(result.Error)
        };
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CouponUpdateRequest request)
    {
        var result = await _coupons.UpdateAsync(id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Conflict => Conflict(result.Error),
            _ => BadRequest(result.Error)
        };
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _coupons.DeleteAsync(id);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }
}
