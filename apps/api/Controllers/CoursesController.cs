using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/courses")]
public class CoursesController : ControllerBase
{
    private readonly CourseCatalogService _courses;

    public CoursesController(CourseCatalogService courses)
    {
        _courses = courses;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? level,
        [FromQuery] string? language,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] double? minRating,
        [FromQuery] string? sort,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var result = await _courses.GetAllAsync(new CourseCatalogQuery(
            search,
            category,
            level,
            language,
            minPrice,
            maxPrice,
            minRating,
            sort,
            page,
            pageSize));

        if (result.TotalCount.HasValue)
        {
            Response.Headers["X-Total-Count"] = result.TotalCount.Value.ToString();
        }

        return Ok(result.Items);
    }

    [HttpGet("compare")]
    public async Task<ActionResult<List<CourseCompareDto>>> Compare([FromQuery] string? ids)
    {
        return Ok(await _courses.CompareAsync(ids));
    }

    [HttpGet("{slug}/related")]
    public async Task<ActionResult<List<CourseListDto>>> GetRelated(string slug, [FromQuery] int? take)
    {
        var courses = await _courses.GetRelatedAsync(slug, take);
        return courses is null ? NotFound() : Ok(courses);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<CourseDetailDto>> GetBySlug(string slug)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");
        var course = await _courses.GetBySlugAsync(slug, userId, isAdmin);
        return course is null ? NotFound() : Ok(course);
    }

    [HttpGet("by-id/{id:int}")]
    public async Task<ActionResult<CourseDetailDto>> GetById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");
        var course = await _courses.GetByIdAsync(id, userId, isAdmin);
        return course is null ? NotFound() : Ok(course);
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpPost]
    public async Task<ActionResult<CourseDetailDto>> Create([FromForm] CourseCreateRequest request)
    {
        var instructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(instructorId))
        {
            return Unauthorized();
        }

        var result = await _courses.CreateAsync(request, instructorId);
        if (result.Status == CourseMutationStatus.BadRequest)
        {
            return BadRequest(result.Error);
        }

        if (result.Course is null)
        {
            return Problem("Unable to create the course.");
        }

        return CreatedAtAction(nameof(GetBySlug), new { slug = result.Course.Slug }, result.Course);
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] CourseUpdateRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");
        var result = await _courses.UpdateAsync(id, request, userId, isAdmin);
        return ToActionResult(result, NoContent());
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");
        var result = await _courses.DeleteAsync(id, userId, isAdmin);
        return ToActionResult(result, NoContent());
    }

    private IActionResult ToActionResult(CourseMutationResult result, IActionResult success)
    {
        return result.Status switch
        {
            CourseMutationStatus.Success => success,
            CourseMutationStatus.BadRequest => BadRequest(result.Error),
            CourseMutationStatus.NotFound => NotFound(),
            CourseMutationStatus.Forbidden => Forbid(),
            _ => Problem("Unable to complete the course operation.")
        };
    }
}
