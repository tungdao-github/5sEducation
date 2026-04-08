using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UsersController(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _db = db;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAt)
            .ToListAsync();

        var courseCounts = await _db.Enrollments
            .AsNoTracking()
            .GroupBy(enrollment => enrollment.UserId)
            .Select(group => new
            {
                UserId = group.Key,
                Count = group.Count()
            })
            .ToDictionaryAsync(item => item.UserId, item => item.Count);

        var results = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var isLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;
            results.Add(new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                AvatarUrl = user.AvatarUrl,
                PhoneNumber = user.PhoneNumber,
                IsAdmin = roles.Contains("Admin"),
                EmailConfirmed = user.EmailConfirmed,
                Roles = roles.ToList(),
                LoyaltyPoints = user.LoyaltyPoints,
                LoyaltyTier = string.IsNullOrWhiteSpace(user.LoyaltyTier) ? "Bronze" : user.LoyaltyTier,
                CourseCount = courseCounts.TryGetValue(user.Id, out var count) ? count : 0,
                Status = isLocked ? "locked" : "active",
                CreatedAt = user.CreatedAt
            });
        }

        return Ok(results);
    }

    [HttpGet("roles")]
    public ActionResult<List<string>> GetRoles()
    {
        var roles = _roleManager.Roles
            .Select(r => r.Name)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name!)
            .OrderBy(name => name)
            .ToList();

        return Ok(roles);
    }

    [HttpPut("{id}/roles")]
    public async Task<IActionResult> UpdateRoles(string id, UserRolesUpdateRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        var requestedRoles = request.Roles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Select(role => role.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (requestedRoles.Count == 0)
        {
            requestedRoles.Add("User");
        }

        if (!requestedRoles.Contains("User", StringComparer.OrdinalIgnoreCase))
        {
            requestedRoles.Add("User");
        }

        var existingRoles = await _roleManager.Roles
            .Select(r => r.Name)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name!)
            .ToListAsync();

        var unknownRoles = requestedRoles
            .Where(role => !existingRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (unknownRoles.Count > 0)
        {
            return BadRequest($"Unknown roles: {string.Join(", ", unknownRoles)}");
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        var removeRoles = currentRoles.Except(requestedRoles, StringComparer.OrdinalIgnoreCase).ToList();
        var addRoles = requestedRoles.Except(currentRoles, StringComparer.OrdinalIgnoreCase).ToList();

        if (removeRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, removeRoles);
            if (!removeResult.Succeeded)
            {
                return BadRequest(removeResult.Errors);
            }
        }

        if (addRoles.Count > 0)
        {
            var addResult = await _userManager.AddToRolesAsync(user, addRoles);
            if (!addResult.Succeeded)
            {
                return BadRequest(addResult.Errors);
            }
        }

        return NoContent();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, UserStatusUpdateRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        var currentUserId = _userManager.GetUserId(User);
        if (request.IsLocked && string.Equals(currentUserId, user.Id, StringComparison.Ordinal))
        {
            return BadRequest("You cannot lock your own account.");
        }

        user.LockoutEnabled = true;
        var lockoutEnd = request.IsLocked
            ? DateTimeOffset.UtcNow.AddYears(100)
            : (DateTimeOffset?)null;

        var lockResult = await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);
        if (!lockResult.Succeeded)
        {
            return BadRequest(lockResult.Errors);
        }

        if (!request.IsLocked)
        {
            await _userManager.ResetAccessFailedCountAsync(user);
        }

        return NoContent();
    }
}
