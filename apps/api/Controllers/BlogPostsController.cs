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
    public async Task<ActionResult<BlogPostDetailDto>> GetBySlug(string slug, [FromQuery] string? locale)
    {
        var isAdmin = User.IsInRole("Admin");
        var post = await _content.GetBlogPostBySlugAsync(slug, isAdmin, locale);
        return post is null ? NotFound() : Ok(post);
    }

    [HttpGet("by-id/{id:int}")]
    public async Task<ActionResult<BlogPostDetailDto>> GetById(int id, [FromQuery] string? locale)
    {
        var post = await _content.GetBlogPostByIdAsync(id, locale);
        return post is null ? NotFound() : Ok(post);
    }
}
