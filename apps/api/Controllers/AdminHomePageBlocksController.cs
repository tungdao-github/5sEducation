using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/homepage/blocks")]
[Authorize(Roles = "Admin")]
public class AdminHomePageBlocksController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminHomePageBlocksController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<HomePageBlockDto>>> GetAll()
    {
        var blocks = await _db.HomePageBlocks
            .AsNoTracking()
            .OrderBy(b => b.SortOrder)
            .ThenBy(b => b.Id)
            .Select(b => new HomePageBlockDto
            {
                Id = b.Id,
                Key = b.Key,
                Type = b.Type,
                Title = b.Title,
                Subtitle = b.Subtitle,
                ImageUrl = b.ImageUrl,
                CtaText = b.CtaText,
                CtaUrl = b.CtaUrl,
                ItemsJson = b.ItemsJson,
                Locale = b.Locale,
                SortOrder = b.SortOrder,
                IsPublished = b.IsPublished
            })
            .ToListAsync();

        return Ok(blocks);
    }

    [HttpPost]
    public async Task<ActionResult<HomePageBlockDto>> Create(HomePageBlockCreateRequest request)
    {
        var block = new HomePageBlock
        {
            Key = request.Key,
            Type = request.Type,
            Title = request.Title,
            Subtitle = request.Subtitle,
            ImageUrl = request.ImageUrl,
            CtaText = request.CtaText,
            CtaUrl = request.CtaUrl,
            ItemsJson = request.ItemsJson,
            Locale = request.Locale,
            SortOrder = request.SortOrder,
            IsPublished = request.IsPublished
        };

        _db.HomePageBlocks.Add(block);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = block.Id }, new HomePageBlockDto
        {
            Id = block.Id,
            Key = block.Key,
            Type = block.Type,
            Title = block.Title,
            Subtitle = block.Subtitle,
            ImageUrl = block.ImageUrl,
            CtaText = block.CtaText,
            CtaUrl = block.CtaUrl,
            ItemsJson = block.ItemsJson,
            Locale = block.Locale,
            SortOrder = block.SortOrder,
            IsPublished = block.IsPublished
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, HomePageBlockUpdateRequest request)
    {
        var block = await _db.HomePageBlocks.FindAsync(id);
        if (block is null)
        {
            return NotFound();
        }

        block.Key = request.Key;
        block.Type = request.Type;
        block.Title = request.Title;
        block.Subtitle = request.Subtitle;
        block.ImageUrl = request.ImageUrl;
        block.CtaText = request.CtaText;
        block.CtaUrl = request.CtaUrl;
        block.ItemsJson = request.ItemsJson;
        block.Locale = request.Locale;
        block.SortOrder = request.SortOrder;
        block.IsPublished = request.IsPublished;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var block = await _db.HomePageBlocks.FindAsync(id);
        if (block is null)
        {
            return NotFound();
        }

        _db.HomePageBlocks.Remove(block);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
