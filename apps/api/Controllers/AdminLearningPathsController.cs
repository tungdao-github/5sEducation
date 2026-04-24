using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/admin/learning-paths")]
[Authorize(Roles = "Admin")]
public class AdminLearningPathsController : ControllerBase
{
    private readonly AdminLearningPathsService _paths;

    public AdminLearningPathsController(AdminLearningPathsService paths)
    {
        _paths = paths;
    }

    [HttpGet]
    public async Task<ActionResult<List<LearningPathListDto>>> GetAll()
    {
        return Ok(await _paths.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LearningPathDetailDto>> GetById(int id)
    {
        var result = await _paths.GetByIdAsync(id);
        return result.Status switch
        {
            AdminCrudStatus.Success => Ok(result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            _ => Problem("Unable to load learning path.")
        };
    }

    [HttpPost]
    public async Task<ActionResult<LearningPathListDto>> Create(LearningPathCreateRequest request)
    {
        var result = await _paths.CreateAsync(request);
        return result.Status switch
        {
            AdminCrudStatus.Success => CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value),
            AdminCrudStatus.Conflict => Conflict(result.Error),
            _ => BadRequest(result.Error)
        };
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, LearningPathUpdateRequest request)
    {
        var result = await _paths.UpdateAsync(id, request);
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
        var result = await _paths.DeleteAsync(id);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }

    [HttpPost("{id:int}/sections")]
    public async Task<ActionResult<LearningPathSectionDto>> CreateSection(int id, LearningPathSectionRequest request)
    {
        var result = await _paths.CreateSectionAsync(id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => CreatedAtAction(nameof(GetById), new { id }, result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }

    [HttpPut("sections/{sectionId:int}")]
    public async Task<IActionResult> UpdateSection(int sectionId, LearningPathSectionRequest request)
    {
        var result = await _paths.UpdateSectionAsync(sectionId, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }

    [HttpDelete("sections/{sectionId:int}")]
    public async Task<IActionResult> DeleteSection(int sectionId)
    {
        var result = await _paths.DeleteSectionAsync(sectionId);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }

    [HttpPost("{id:int}/courses")]
    public async Task<ActionResult<LearningPathCourseDto>> AddCourse(int id, LearningPathCourseRequest request)
    {
        var result = await _paths.AddCourseAsync(id, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => CreatedAtAction(nameof(GetById), new { id }, result.Value),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }

    [HttpPut("courses/{pathCourseId:int}")]
    public async Task<IActionResult> UpdateCourse(int pathCourseId, LearningPathCourseRequest request)
    {
        var result = await _paths.UpdateCourseAsync(pathCourseId, request);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }

    [HttpDelete("courses/{pathCourseId:int}")]
    public async Task<IActionResult> DeleteCourse(int pathCourseId)
    {
        var result = await _paths.DeleteCourseAsync(pathCourseId);
        return result.Status switch
        {
            AdminCrudStatus.Success => NoContent(),
            AdminCrudStatus.NotFound => NotFound(),
            _ => BadRequest(result.Error)
        };
    }
}
