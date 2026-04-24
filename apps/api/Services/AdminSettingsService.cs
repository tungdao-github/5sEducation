using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminSettingsService
{
    private readonly IAdminSettingsRepository _repository;

    public AdminSettingsService(IAdminSettingsRepository repository)
    {
        _repository = repository;
    }

    public Task<List<SystemSettingDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(cancellationToken);
    }

    public async Task<AdminCrudResult<SystemSettingDto>> UpsertAsync(string key, SystemSettingUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedKey = key.Trim();
        if (string.IsNullOrWhiteSpace(normalizedKey))
        {
            return AdminCrudResult<SystemSettingDto>.BadRequest("Key is required.");
        }

        var setting = await _repository.FindByKeyAsync(normalizedKey, cancellationToken);
        if (setting is null)
        {
            setting = new SystemSetting { Key = normalizedKey };
            await _repository.AddAsync(setting, cancellationToken);
        }

        setting.Value = request.Value?.Trim() ?? string.Empty;
        setting.Group = request.Group?.Trim() ?? string.Empty;
        setting.Description = request.Description?.Trim();
        setting.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<SystemSettingDto>.Success(new SystemSettingDto
        {
            Key = setting.Key,
            Value = setting.Value,
            Group = setting.Group,
            Description = setting.Description,
            UpdatedAt = setting.UpdatedAt
        });
    }

    public async Task<string> BumpCacheVersionAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var setting = await _repository.FindByKeyAsync("cacheVersion", cancellationToken);
        if (setting is null)
        {
            setting = new SystemSetting
            {
                Key = "cacheVersion",
                Group = "system",
                Value = now.Ticks.ToString(),
                UpdatedAt = now
            };
            await _repository.AddAsync(setting, cancellationToken);
        }
        else
        {
            setting.Value = now.Ticks.ToString();
            setting.UpdatedAt = now;
        }

        await _repository.SaveChangesAsync(cancellationToken);
        return setting.Value;
    }
}
