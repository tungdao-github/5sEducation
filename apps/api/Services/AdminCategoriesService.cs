using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminCategoriesService
{
    private readonly IAdminCategoriesRepository _repository;

    public AdminCategoriesService(IAdminCategoriesRepository repository)
    {
        _repository = repository;
    }

    public Task<List<CategoryAdminDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(cancellationToken);
    }

    public async Task<AdminCrudResult<CategoryAdminDto>> CreateAsync(CategoryCreateRequest request, CancellationToken cancellationToken = default)
    {
        var slug = SlugHelper.Slugify(request.Title);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return AdminCrudResult<CategoryAdminDto>.BadRequest("Title is required.");
        }

        if (await _repository.ExistsBySlugAsync(slug, cancellationToken: cancellationToken))
        {
            return AdminCrudResult<CategoryAdminDto>.Conflict("Category already exists.");
        }

        var category = new Category
        {
            Title = request.Title.Trim(),
            Slug = slug
        };

        await _repository.AddAsync(category, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return AdminCrudResult<CategoryAdminDto>.Success(new CategoryAdminDto
        {
            Id = category.Id,
            Title = category.Title,
            Slug = category.Slug,
            CourseCount = 0
        });
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(int id, CategoryUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var category = await _repository.FindAsync(id, cancellationToken);
        if (category is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        var slug = SlugHelper.Slugify(request.Title);
        if (string.IsNullOrWhiteSpace(slug))
        {
            return AdminCrudResult<object?>.BadRequest("Title is required.");
        }

        if (await _repository.ExistsBySlugAsync(slug, id, cancellationToken))
        {
            return AdminCrudResult<object?>.Conflict("Category slug already exists.");
        }

        category.Title = request.Title.Trim();
        category.Slug = slug;
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _repository.FindAsync(id, cancellationToken);
        if (category is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (await _repository.HasCoursesAsync(id, cancellationToken))
        {
            return AdminCrudResult<object?>.BadRequest("Cannot delete category with courses.");
        }

        await _repository.RemoveAsync(category, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
