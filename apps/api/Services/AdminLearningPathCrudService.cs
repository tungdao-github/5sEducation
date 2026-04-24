using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminLearningPathCrudService
{
    private readonly IAdminLearningPathsRepository _repository;

    public AdminLearningPathCrudService(IAdminLearningPathsRepository repository)
    {
        _repository = repository;
    }

    public Task<List<LearningPathListDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(cancellationToken);
    }

    public async Task<AdminCrudResult<LearningPathDetailDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var path = await _repository.FindByIdAsync(id, includeGraph: true, cancellationToken);
        if (path is null)
        {
            return AdminCrudResult<LearningPathDetailDto>.NotFound();
        }

        var sections = path.Sections
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Id)
            .Select(LearningPathAdminHelper.MapSection)
            .ToList();

        var courses = path.Courses
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Id)
            .Select(c => LearningPathAdminHelper.MapCourse(c, c.Course))
            .ToList();

        return AdminCrudResult<LearningPathDetailDto>.Success(LearningPathAdminHelper.MapDetail(path, sections, courses));
    }

    public async Task<AdminCrudResult<LearningPathListDto>> CreateAsync(LearningPathCreateRequest request, CancellationToken cancellationToken = default)
    {
        var slug = SlugHelper.Slugify(request.Title);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return AdminCrudResult<LearningPathListDto>.BadRequest("Title is required.");
        }

        if (await _repository.SlugExistsAsync(slug, cancellationToken: cancellationToken))
        {
            return AdminCrudResult<LearningPathListDto>.Conflict("Learning path already exists.");
        }

        var now = DateTime.UtcNow;
        var path = new LearningPath
        {
            Title = request.Title,
            Slug = slug,
            Description = request.Description,
            Level = request.Level,
            ThumbnailUrl = request.ThumbnailUrl,
            EstimatedHours = request.EstimatedHours,
            IsPublished = request.IsPublished,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(path, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<LearningPathListDto>.Success(LearningPathAdminHelper.MapList(path));
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(int id, LearningPathUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var path = await _repository.FindByIdAsync(id, includeGraph: false, cancellationToken);
        if (path is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        var slug = SlugHelper.Slugify(request.Title);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return AdminCrudResult<object?>.BadRequest("Title is required.");
        }

        if (await _repository.SlugExistsAsync(slug, id, cancellationToken))
        {
            return AdminCrudResult<object?>.Conflict("Learning path slug already exists.");
        }

        path.Title = request.Title;
        path.Slug = slug;
        path.Description = request.Description;
        path.Level = request.Level;
        path.ThumbnailUrl = request.ThumbnailUrl;
        path.EstimatedHours = request.EstimatedHours;
        path.IsPublished = request.IsPublished;
        path.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var hasPath = await _repository.FindByIdAsync(id, includeGraph: false, cancellationToken);
        if (hasPath is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        var courseLinks = await _repository.FindByIdAsync(id, includeGraph: true, cancellationToken);
        if (courseLinks is not null)
        {
            if (courseLinks.Courses.Count > 0)
            {
                await _repository.RemoveRangeAsync(courseLinks.Courses, cancellationToken);
            }

            if (courseLinks.Sections.Count > 0)
            {
                await _repository.RemoveRangeAsync(courseLinks.Sections, cancellationToken);
            }
        }

        await _repository.RemoveAsync(new LearningPath { Id = id }, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
