using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminCategoriesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryAdminDto>>> GetAll()
    {
        var categories = await _db.Categories
            .OrderBy(c => c.Title)
            .Select(c => new CategoryAdminDto
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug,
                CourseCount = c.Courses.Count
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryAdminDto>> Create(CategoryCreateRequest request)
    {
        var slug = SlugHelper.Slugify(request.Title);
        var exists = await _db.Categories.AnyAsync(c => c.Slug == slug);
        if (exists)
        {
            return Conflict("Category already exists.");
        }

        var category = new Models.Category
        {
            Title = request.Title,
            Slug = slug
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = category.Id }, new CategoryAdminDto
        {
            Id = category.Id,
            Title = category.Title,
            Slug = category.Slug,
            CourseCount = 0
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CategoryUpdateRequest request)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category is null)
        {
            return NotFound();
        }

        var slug = SlugHelper.Slugify(request.Title);
        var slugExists = await _db.Categories.AnyAsync(c => c.Slug == slug && c.Id != id);
        if (slugExists)
        {
            return Conflict("Category slug already exists.");
        }

        category.Title = request.Title;
        category.Slug = slug;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _db.Categories.Include(c => c.Courses).FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
        {
            return NotFound();
        }

        if (category.Courses.Count > 0)
        {
            return BadRequest("Cannot delete category with courses.");
        }

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
