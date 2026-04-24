using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoriesController : ControllerBase
{
    private readonly AdminCategoriesService _categories;

    public AdminCategoriesController(AdminCategoriesService categories)
    {
        _categories = categories;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryAdminDto>>> GetAll()
    {
        return Ok(await _categories.GetAllAsync());
    }

    [HttpPost]
    public async Task<ActionResult<CategoryAdminDto>> Create(CategoryCreateRequest request)
    {
        var result = await _categories.CreateAsync(request);
        return result.Status switch
        {
            AdminCrudStatus.Success => CreatedAtAction(nameof(GetAll), new { id = result.Value!.Id }, result.Value),
            AdminCrudStatus.Conflict => Conflict(result.Error),
            _ => BadRequest(result.Error)
        };
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CategoryUpdateRequest request)
    {
        var result = await _categories.UpdateAsync(id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            AdminCrudStatus.Conflict => Conflict(result.Error),
            _ => BadRequest(result.Error)
        };
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _categories.DeleteAsync(id);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }
}
