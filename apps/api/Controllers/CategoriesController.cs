using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly PublicContentService _content;

    public CategoriesController(PublicContentService content)
    {
        _content = content;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        return Ok(await _content.GetCategoriesAsync());
    }
}
