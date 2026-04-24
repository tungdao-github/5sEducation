using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public class AdminLearningPathsService
{
    private readonly AdminLearningPathCrudService _crudService;
    private readonly AdminLearningPathsStructureService _structureService;

    public AdminLearningPathsService(AdminLearningPathCrudService crudService, AdminLearningPathsStructureService structureService)
    {
        _crudService = crudService;
        _structureService = structureService;
    }

    public Task<List<LearningPathListDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _crudService.GetAllAsync(cancellationToken);
    }

    public async Task<AdminCrudResult<LearningPathDetailDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _crudService.GetByIdAsync(id, cancellationToken);
    }

    public async Task<AdminCrudResult<LearningPathListDto>> CreateAsync(LearningPathCreateRequest request, CancellationToken cancellationToken = default)
    {
        return await _crudService.CreateAsync(request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(int id, LearningPathUpdateRequest request, CancellationToken cancellationToken = default)
    {
        return await _crudService.UpdateAsync(id, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _crudService.DeleteAsync(id, cancellationToken);
    }

    public async Task<AdminCrudResult<LearningPathSectionDto>> CreateSectionAsync(int id, LearningPathSectionRequest request, CancellationToken cancellationToken = default)
    {
        return await _structureService.CreateSectionAsync(id, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> UpdateSectionAsync(int sectionId, LearningPathSectionRequest request, CancellationToken cancellationToken = default)
    {
        return await _structureService.UpdateSectionAsync(sectionId, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> DeleteSectionAsync(int sectionId, CancellationToken cancellationToken = default)
    {
        return await _structureService.DeleteSectionAsync(sectionId, cancellationToken);
    }

    public async Task<AdminCrudResult<LearningPathCourseDto>> AddCourseAsync(int id, LearningPathCourseRequest request, CancellationToken cancellationToken = default)
    {
        return await _structureService.AddCourseAsync(id, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> UpdateCourseAsync(int pathCourseId, LearningPathCourseRequest request, CancellationToken cancellationToken = default)
    {
        return await _structureService.UpdateCourseAsync(pathCourseId, request, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> DeleteCourseAsync(int pathCourseId, CancellationToken cancellationToken = default)
    {
        return await _structureService.DeleteCourseAsync(pathCourseId, cancellationToken);
    }
}
