using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminLearningPathCoursesService
{
    private readonly IAdminLearningPathsRepository _repository;

    public AdminLearningPathCoursesService(IAdminLearningPathsRepository repository)
    {
        _repository = repository;
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

        var item = new Models.LearningPathCourse
        {
            LearningPathId = id,
            LearningPathSectionId = request.LearningPathSectionId,
            CourseId = request.CourseId,
            SortOrder = request.SortOrder,
            IsRequired = request.IsRequired
        };

        await _repository.AddAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        await _repository.TouchAsync(id, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
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
        await _repository.TouchAsync(item.LearningPathId, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
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
        await _repository.TouchAsync(item.LearningPathId, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
