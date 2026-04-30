using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminLearningPathsStructureService
{
    private readonly AdminLearningPathSectionsService _sections;
    private readonly AdminLearningPathCoursesService _courses;

    public AdminLearningPathsStructureService(
        AdminLearningPathSectionsService sections,
        AdminLearningPathCoursesService courses)
    {
        _sections = sections;
        _courses = courses;
    }

    public Task<AdminCrudResult<LearningPathSectionDto>> CreateSectionAsync(int id, LearningPathSectionRequest request, CancellationToken cancellationToken = default)
    {
        return _sections.CreateSectionAsync(id, request, cancellationToken);
    }

    public Task<AdminCrudResult<object?>> UpdateSectionAsync(int sectionId, LearningPathSectionRequest request, CancellationToken cancellationToken = default)
    {
        return _sections.UpdateSectionAsync(sectionId, request, cancellationToken);
    }

    public Task<AdminCrudResult<object?>> DeleteSectionAsync(int sectionId, CancellationToken cancellationToken = default)
    {
        return _sections.DeleteSectionAsync(sectionId, cancellationToken);
    }

    public Task<AdminCrudResult<LearningPathCourseDto>> AddCourseAsync(int id, LearningPathCourseRequest request, CancellationToken cancellationToken = default)
    {
        return _courses.AddCourseAsync(id, request, cancellationToken);
    }

    public Task<AdminCrudResult<object?>> UpdateCourseAsync(int pathCourseId, LearningPathCourseRequest request, CancellationToken cancellationToken = default)
    {
        return _courses.UpdateCourseAsync(pathCourseId, request, cancellationToken);
    }

    public Task<AdminCrudResult<object?>> DeleteCourseAsync(int pathCourseId, CancellationToken cancellationToken = default)
    {
        return _courses.DeleteCourseAsync(pathCourseId, cancellationToken);
    }
}
