using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/reviews")]
[Authorize(Roles = "Admin")]
public class AdminReviewsController : ControllerBase
{
    private readonly AdminReviewsService _reviews;

    public AdminReviewsController(AdminReviewsService reviews)
    {
        _reviews = reviews;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminReviewDto>>> GetAll([FromQuery] int? courseId, [FromQuery] string? query, [FromQuery] int? take)
    {
        return Ok(await _reviews.GetAllAsync(courseId, query, take));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        return await _reviews.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
