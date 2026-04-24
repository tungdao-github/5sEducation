using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminLearningPathsStructureService
{
    private readonly IAdminLearningPathsRepository _repository;

    public AdminLearningPathsStructureService(IAdminLearningPathsRepository repository)
    {
        _repository = repository;
    }

    public async Task<AdminCrudResult<LearningPathSectionDto>> CreateSectionAsync(int id, LearningPathSectionRequest request, CancellationToken cancellationToken = default)
    {
        var path = await _repository.FindByIdAsync(id, includeGraph: false, cancellationToken);
        if (path is null)
        {
            return AdminCrudResult<LearningPathSectionDto>.NotFound();
        }

        var section = new LearningPathSection
        {
            LearningPathId = id,
            Title = request.Title,
            Description = request.Description,
            SortOrder = request.SortOrder
        };

        await _repository.AddAsync(section, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        await TouchPathAsync(id, cancellationToken);
        return AdminCrudResult<LearningPathSectionDto>.Success(LearningPathAdminHelper.MapSection(section));
    }

    public async Task<AdminCrudResult<object?>> UpdateSectionAsync(int sectionId, LearningPathSectionRequest request, CancellationToken cancellationToken = default)
    {
        var section = await _repository.FindSectionAsync(sectionId, cancellationToken);
        if (section is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        section.Title = request.Title;
        section.Description = request.Description;
        section.SortOrder = request.SortOrder;

        await _repository.SaveChangesAsync(cancellationToken);
        await TouchPathAsync(section.LearningPathId, cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteSectionAsync(int sectionId, CancellationToken cancellationToken = default)
    {
        var section = await _repository.FindSectionAsync(sectionId, cancellationToken);
        if (section is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        await _repository.RemoveAsync(section, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        await TouchPathAsync(section.LearningPathId, cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<LearningPathCourseDto>> AddCourseAsync(int id, LearningPathCourseRequest request, CancellationToken cancellationToken = default)
    {
        var path = await _repository.FindByIdAsync(id, includeGraph: false, cancellationToken);
        if (path is null)
        {
            return AdminCrudResult<LearningPathCourseDto>.NotFound();
        }

        var course = await _repository.FindCourseAsync(request.CourseId, cancellationToken);
        if (course is null)
        {
            return AdminCrudResult<LearningPathCourseDto>.BadRequest("Course not found.");
        }

        var item = new LearningPathCourse
        {
            LearningPathId = id,
            LearningPathSectionId = request.LearningPathSectionId,
            CourseId = request.CourseId,
            SortOrder = request.SortOrder,
            IsRequired = request.IsRequired
        };

        await _repository.AddAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        await TouchPathAsync(id, cancellationToken);
        return AdminCrudResult<LearningPathCourseDto>.Success(LearningPathAdminHelper.MapCourse(item, course));
    }

    public async Task<AdminCrudResult<object?>> UpdateCourseAsync(int pathCourseId, LearningPathCourseRequest request, CancellationToken cancellationToken = default)
    {
        var item = await _repository.FindCourseLinkAsync(pathCourseId, cancellationToken);
        if (item is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        item.CourseId = request.CourseId;
        item.LearningPathSectionId = request.LearningPathSectionId;
        item.SortOrder = request.SortOrder;
        item.IsRequired = request.IsRequired;

        await _repository.SaveChangesAsync(cancellationToken);
        await TouchPathAsync(item.LearningPathId, cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteCourseAsync(int pathCourseId, CancellationToken cancellationToken = default)
    {
        var item = await _repository.FindCourseLinkAsync(pathCourseId, cancellationToken);
        if (item is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        await _repository.RemoveAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        await TouchPathAsync(item.LearningPathId, cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    private async Task TouchPathAsync(int learningPathId, CancellationToken cancellationToken)
    {
        var path = await _repository.FindByIdAsync(learningPathId, includeGraph: false, cancellationToken);
        if (path is null)
        {
            return;
        }

        path.UpdatedAt = DateTime.UtcNow;
        await _repository.SaveChangesAsync(cancellationToken);
    }
}
