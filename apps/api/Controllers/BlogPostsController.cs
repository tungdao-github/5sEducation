using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/blog/posts")]
public class BlogPostsController : ControllerBase
{
    private readonly PublicContentService _content;

    public BlogPostsController(PublicContentService content)
    {
        _content = content;
    }

    [HttpGet]
    public async Task<ActionResult<List<BlogPostListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? tag,
        [FromQuery] string? locale,
        [FromQuery] int? take)
    {
        return Ok(await _content.GetBlogPostsAsync(search, tag, locale, take));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<BlogPostDetailDto>> GetBySlug(string slug)
    {
        var isAdmin = User.IsInRole("Admin");
        var post = await _content.GetBlogPostBySlugAsync(slug, isAdmin);
        return post is null ? NotFound() : Ok(post);
    }

    [HttpGet("by-id/{id:int}")]
    public async Task<ActionResult<BlogPostDetailDto>> GetById(int id)
    {
        var post = await _content.GetBlogPostByIdAsync(id);
        return post is null ? NotFound() : Ok(post);
    }
}
