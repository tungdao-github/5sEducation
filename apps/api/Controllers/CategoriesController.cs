using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CategoriesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        var categories = await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.Title)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug
            })
            .ToListAsync();

        return Ok(categories);
    }
}
