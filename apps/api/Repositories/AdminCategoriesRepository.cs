using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminCategoriesRepository
{
    Task<List<CategoryAdminDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<Category?> FindAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> HasCoursesAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Category category, CancellationToken cancellationToken = default);
    Task RemoveAsync(Category category, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminCategoriesRepository : IAdminCategoriesRepository
{
    private readonly ApplicationDbContext _db;

    public AdminCategoriesRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<CategoryAdminDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.Title)
            .Select(c => new CategoryAdminDto
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug,
                CourseCount = c.Courses.Count
            })
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsBySlugAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Categories.AsNoTracking().Where(c => c.Slug == slug);
        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public Task<Category?> FindAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Categories.FindAsync([id], cancellationToken).AsTask();
    }

    public Task<bool> HasCoursesAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Courses.AsNoTracking().AnyAsync(c => c.CategoryId == id, cancellationToken);
    }

    public Task AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        _db.Categories.Add(category);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Category category, CancellationToken cancellationToken = default)
    {
        _db.Categories.Remove(category);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
