using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly UserReviewsService _reviews;

    public ReviewsController(UserReviewsService reviews)
    {
        _reviews = reviews;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReviewDto>>> GetByCourse([FromQuery] int courseId)
    {
        return Ok(await _reviews.GetByCourseAsync(courseId));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Upsert(ReviewCreateRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _reviews.UpsertAsync(userId, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }

    [Authorize]
    [HttpDelete("{courseId:int}")]
    public async Task<IActionResult> Delete(int courseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var result = await _reviews.DeleteAsync(userId, courseId);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => Problem("Unable to delete review.")
        };
    }
}
