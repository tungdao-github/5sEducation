using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/homepage/blocks")]
[Authorize(Roles = "Admin")]
public class AdminHomePageBlocksController : ControllerBase
{
    private readonly AdminHomePageBlocksService _blocks;

    public AdminHomePageBlocksController(AdminHomePageBlocksService blocks)
    {
        _blocks = blocks;
    }

    [HttpGet]
    public async Task<ActionResult<List<HomePageBlockDto>>> GetAll()
    {
        return Ok(await _blocks.GetAllAsync());
    }

    [HttpPost]
    public async Task<ActionResult<HomePageBlockDto>> Create(HomePageBlockCreateRequest request)
    {
        var dto = await _blocks.CreateAsync(request);
        return CreatedAtAction(nameof(GetAll), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, HomePageBlockUpdateRequest request)
    {
        return await _blocks.UpdateAsync(id, request) ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        return await _blocks.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
