using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Hubs;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/support/messages")]
[EnableRateLimiting("auth")]
public class SupportController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly IHubContext<SupportHub> _hub;

    public SupportController(
        ApplicationDbContext db,
        IEmailSender emailSender,
        IHubContext<SupportHub> hub)
    {
        _db = db;
        _emailSender = emailSender;
        _hub = hub;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<SupportMessageDto>> Create(SupportMessageCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("Message is required.");
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var name = request.Name?.Trim() ?? string.Empty;
        var email = request.Email?.Trim() ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                name = $"{user.FirstName} {user.LastName}".Trim();
                email = user.Email ?? emailClaim ?? email;
            }
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            name = email.Split('@')[0];
        }

        var message = new SupportMessage
        {
            UserId = userId,
            Name = name,
            Email = email,
            Message = request.Message.Trim(),
            Status = "open",
            CreatedAt = DateTime.UtcNow
        };

        _db.SupportMessages.Add(message);
        await _db.SaveChangesAsync();

        var dto = new SupportMessageDto
        {
            Id = message.Id,
            UserId = message.UserId,
            UserEmail = emailClaim,
            Name = message.Name,
            Email = message.Email,
            Message = message.Message,
            Status = message.Status,
            CreatedAt = message.CreatedAt
        };

        await _hub.Clients.Group(SupportHub.AdminGroup)
            .SendAsync("support:message:new", dto);

        if (!string.IsNullOrWhiteSpace(message.UserId))
        {
            await _hub.Clients.Group(SupportHub.UserGroup(message.UserId))
                .SendAsync("support:message:new", dto);
        }

        return Ok(dto);
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<SupportMessageDto>>> ListMine()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var items = await _db.SupportMessages.AsNoTracking()
            .Where(m => m.UserId == userId)
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

    [Authorize]
    [HttpGet("{id:int}/replies")]
    public async Task<ActionResult<List<SupportReplyDto>>> ListReplies(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        var message = await _db.SupportMessages.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        if (message == null)
        {
            return NotFound();
        }

        if (!isAdmin && message.UserId != userId)
        {
            return Forbid();
        }

        var replies = await _db.SupportReplies.AsNoTracking()
            .Where(r => r.SupportMessageId == id)
            .OrderBy(r => r.CreatedAt)
            .Select(r => new SupportReplyDto
            {
                Id = r.Id,
                SupportMessageId = r.SupportMessageId,
                AuthorRole = r.AuthorRole,
                AuthorName = r.AuthorName,
                Message = r.Message,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(replies);
    }

    [Authorize]
    [HttpPost("{id:int}/replies")]
    public async Task<ActionResult<SupportReplyDto>> AddReply(int id, SupportReplyCreateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        var message = await _db.SupportMessages.FirstOrDefaultAsync(m => m.Id == id);
        if (message == null)
        {
            return NotFound();
        }

        if (!isAdmin && message.UserId != userId)
        {
            return Forbid();
        }

        var authorName = "User";
        if (isAdmin)
        {
            authorName = "Admin";
        }
        else if (!string.IsNullOrWhiteSpace(userId))
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                authorName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(authorName))
                {
                    authorName = user.Email ?? "User";
                }
            }
        }

        var reply = new SupportReply
        {
            SupportMessageId = message.Id,
            AuthorRole = isAdmin ? "admin" : "user",
            AuthorName = authorName,
            Message = request.Message.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.SupportReplies.Add(reply);
        message.Status = isAdmin ? "answered" : "open";
        message.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var replyDto = new SupportReplyDto
        {
            Id = reply.Id,
            SupportMessageId = reply.SupportMessageId,
            AuthorRole = reply.AuthorRole,
            AuthorName = reply.AuthorName,
            Message = reply.Message,
            CreatedAt = reply.CreatedAt
        };

        await _hub.Clients.Group(SupportHub.AdminGroup)
            .SendAsync("support:reply:new", replyDto);

        if (!string.IsNullOrWhiteSpace(message.UserId))
        {
            await _hub.Clients.Group(SupportHub.UserGroup(message.UserId))
                .SendAsync("support:reply:new", replyDto);
        }

        if (isAdmin && !string.IsNullOrWhiteSpace(message.Email))
        {
            await _emailSender.SendAsync(
                message.Email,
                "Support reply",
                $"Admin replied: {reply.Message}");
        }

        return Ok(replyDto);
    }
}
