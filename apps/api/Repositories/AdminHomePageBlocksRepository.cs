using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminHomePageBlocksRepository
{
    Task<List<HomePageBlockDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<HomePageBlock?> FindAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(HomePageBlock block, CancellationToken cancellationToken = default);
    Task RemoveAsync(HomePageBlock block, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminHomePageBlocksRepository : IAdminHomePageBlocksRepository
{
    private readonly ApplicationDbContext _db;

    public AdminHomePageBlocksRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<HomePageBlockDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.HomePageBlocks
            .AsNoTracking()
            .OrderBy(b => b.SortOrder)
            .ThenBy(b => b.Id)
            .Select(b => new HomePageBlockDto
            {
                Id = b.Id,
                Key = b.Key,
                Type = b.Type,
                Title = b.Title,
                Subtitle = b.Subtitle,
                ImageUrl = b.ImageUrl,
                CtaText = b.CtaText,
                CtaUrl = b.CtaUrl,
                ItemsJson = b.ItemsJson,
                Locale = b.Locale,
                SortOrder = b.SortOrder,
                IsPublished = b.IsPublished
            })
            .ToListAsync(cancellationToken);
    }

    public Task<HomePageBlock?> FindAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.HomePageBlocks.FindAsync([id], cancellationToken).AsTask();
    }

    public Task AddAsync(HomePageBlock block, CancellationToken cancellationToken = default)
    {
        _db.HomePageBlocks.Add(block);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(HomePageBlock block, CancellationToken cancellationToken = default)
    {
        _db.HomePageBlocks.Remove(block);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
