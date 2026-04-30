using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminLearningPathSectionsService
{
    private readonly IAdminLearningPathsRepository _repository;

    public AdminLearningPathSectionsService(IAdminLearningPathsRepository repository)
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
        await _repository.TouchAsync(id, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
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
        await _repository.TouchAsync(section.LearningPathId, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
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
        await _repository.TouchAsync(section.LearningPathId, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
