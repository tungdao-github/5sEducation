using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/blog")]
public class BlogCommentsController : ControllerBase
{
    private readonly BlogCommentsService _comments;

    public BlogCommentsController(BlogCommentsService comments)
    {
        _comments = comments;
    }

    [HttpGet("posts/{slug}/comments")]
    public async Task<ActionResult<List<BlogCommentDto>>> GetComments(string slug)
    {
        string? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        var comments = await _comments.GetCommentsAsync(slug, userId);
        return comments is null ? NotFound() : Ok(comments);
    }

    [Authorize]
    [HttpPost("posts/{slug}/comments")]
    public async Task<ActionResult<BlogCommentDto>> Create(string slug, [FromBody] BlogCommentCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest("Content is required.");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var dto = await _comments.CreateAsync(slug, userId, request.Content);
        return dto is null ? NotFound() : Ok(dto);
    }

    [Authorize]
    [HttpPost("comments/{id:int}/like")]
    public async Task<ActionResult<BlogCommentLikeDto>> ToggleLike(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var dto = await _comments.ToggleLikeAsync(id, userId);
        return dto is null ? NotFound() : Ok(dto);
    }
}
