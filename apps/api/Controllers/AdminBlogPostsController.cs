using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/blog/posts")]
[Authorize(Roles = "Admin")]
public class AdminBlogPostsController : ControllerBase
{
    private readonly AdminBlogPostsService _posts;

    public AdminBlogPostsController(AdminBlogPostsService posts)
    {
        _posts = posts;
    }

    [HttpGet]
    public async Task<ActionResult<List<BlogPostListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? locale,
        [FromQuery] string? status)
    {
        return Ok(await _posts.GetAllAsync(search, locale, status));
    }

    [HttpPost]
    public async Task<ActionResult<BlogPostDetailDto>> Create([FromBody] BlogPostCreateRequest request)
    {
        var result = await _posts.CreateAsync(request);
        return result.Status switch
        {
            AdminCrudStatus.Success => CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value),
            AdminCrudStatus.BadRequest => BadRequest(result.Error),
            AdminCrudStatus.Conflict => Conflict(result.Error),
            _ => Problem("Unable to create blog post.")
        };
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BlogPostDetailDto>> GetById(int id)
    {
        var result = await _posts.GetByIdAsync(id);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            _ => Problem("Unable to load blog post.")
        };
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] BlogPostUpdateRequest request)
    {
        var result = await _posts.UpdateAsync(id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.BadRequest => BadRequest(result.Error),
            AdminCrudStatus.Conflict => Conflict(result.Error),
            _ => Problem("Unable to update blog post.")
        };
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _posts.DeleteAsync(id);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => Problem("Unable to delete blog post.")
        };
    }
}
