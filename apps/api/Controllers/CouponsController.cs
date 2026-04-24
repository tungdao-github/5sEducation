using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController : ControllerBase
{
    private readonly CouponValidationService _coupons;

    public CouponsController(CouponValidationService coupons)
    {
        _coupons = coupons;
    }

    [HttpGet("validate")]
    public async Task<ActionResult<CouponValidateResponseDto>> Validate([FromQuery] string code, [FromQuery] decimal? subtotal)
    {
        return Ok(await _coupons.ValidateAsync(code, subtotal));
    }
}
