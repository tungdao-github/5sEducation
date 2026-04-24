using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminSettingsRepository
{
    Task<List<SystemSettingDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SystemSetting?> FindByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task AddAsync(SystemSetting setting, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminSettingsRepository : IAdminSettingsRepository
{
    private readonly ApplicationDbContext _db;

    public AdminSettingsRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<SystemSettingDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.SystemSettings
            .AsNoTracking()
            .OrderBy(s => s.Group)
            .ThenBy(s => s.Key)
            .Select(s => new SystemSettingDto
            {
                Key = s.Key,
                Value = s.Value,
                Group = s.Group,
                Description = s.Description,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task<SystemSetting?> FindByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        return _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == key, cancellationToken);
    }

    public Task AddAsync(SystemSetting setting, CancellationToken cancellationToken = default)
    {
        _db.SystemSettings.Add(setting);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
