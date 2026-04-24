using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/support/messages")]
[EnableRateLimiting("auth")]
public class SupportController : ControllerBase
{
    private readonly SupportService _support;

    public SupportController(SupportService support)
    {
        _support = support;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<SupportMessageDto>> Create(SupportMessageCreateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var result = await _support.CreateAsync(userId, emailClaim, request);

        return result.Status switch
        {
            SupportMutationStatus.Success => Ok(result.Value),
            SupportMutationStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to create support message.")
        };
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

        return Ok(await _support.ListMineAsync(userId));
    }

    [Authorize]
    [HttpGet("{id:int}/replies")]
    public async Task<ActionResult<List<SupportReplyDto>>> ListReplies(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        var result = await _support.ListRepliesAsync(id, userId, isAdmin);

        return result.Status switch
        {
            SupportMutationStatus.Success => Ok(result.Value),
            SupportMutationStatus.NotFound => NotFound(),
            SupportMutationStatus.Forbidden => Forbid(),
            _ => Problem("Unable to list support replies.")
        };
    }

    [Authorize]
    [HttpPost("{id:int}/replies")]
    public async Task<ActionResult<SupportReplyDto>> AddReply(int id, SupportReplyCreateRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        var result = await _support.AddReplyAsync(id, userId, isAdmin, request);

        return result.Status switch
        {
            SupportMutationStatus.Success => Ok(result.Value),
            SupportMutationStatus.NotFound => NotFound(),
            SupportMutationStatus.Forbidden => Forbid(),
            SupportMutationStatus.BadRequest => BadRequest(result.Error),
            _ => Problem("Unable to add support reply.")
        };
    }
}
