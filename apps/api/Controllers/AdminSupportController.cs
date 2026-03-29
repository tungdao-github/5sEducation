using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/support/messages")]
[Authorize(Roles = "Admin")]
public class AdminSupportController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminSupportController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SupportMessageDto>>> List([FromQuery] string? status)
    {
        var query = _db.SupportMessages.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(m => m.Status == status);
        }

        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new SupportMessageDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserEmail = m.User != null ? m.User.Email : null,
                Name = m.Name,
                Email = m.Email,
                Message = m.Message,
                Status = m.Status,
                AdminNote = m.AdminNote,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SupportMessageDto>> Update(int id, SupportMessageAdminUpdateRequest request)
    {
        var message = await _db.SupportMessages.FirstOrDefaultAsync(m => m.Id == id);
        if (message == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            message.Status = request.Status.Trim();
        }

        if (request.AdminNote != null)
        {
            message.AdminNote = request.AdminNote.Trim();
        }

        message.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new SupportMessageDto
        {
            Id = message.Id,
            UserId = message.UserId,
            UserEmail = message.User?.Email,
            Name = message.Name,
            Email = message.Email,
            Message = message.Message,
            Status = message.Status,
            AdminNote = message.AdminNote,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt
        });
    }
}
