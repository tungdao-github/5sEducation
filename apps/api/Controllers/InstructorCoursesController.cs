using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/instructor/courses")]
[Authorize(Roles = "Admin,Instructor")]
public class InstructorCoursesController : ControllerBase
{
    private readonly InstructorCoursesService _courses;

    public InstructorCoursesController(InstructorCoursesService courses)
    {
        _courses = courses;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseManageDto>>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole("Admin");
        return Ok(await _courses.GetMineAsync(userId, isAdmin));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourseDetailDto>> GetById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole("Admin");
        var result = await _courses.GetByIdAsync(id, userId, isAdmin);
        return result.Status switch
        {
            InstructorCourseAccessStatus.Success => Ok(result.Value),
            InstructorCourseAccessStatus.NotFound => NotFound(),
            InstructorCourseAccessStatus.Forbidden => Forbid(),
            _ => Problem("Unable to load course.")
        };
    }
}
