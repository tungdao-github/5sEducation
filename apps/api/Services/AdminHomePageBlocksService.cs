using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminHomePageBlocksService
{
    private readonly IAdminHomePageBlocksRepository _repository;

    public AdminHomePageBlocksService(IAdminHomePageBlocksRepository repository)
    {
        _repository = repository;
    }

    public Task<List<HomePageBlockDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(cancellationToken);
    }

    public async Task<HomePageBlockDto> CreateAsync(HomePageBlockCreateRequest request, CancellationToken cancellationToken = default)
    {
        var block = new HomePageBlock
        {
            Key = request.Key,
            Type = request.Type,
            Title = request.Title,
            Subtitle = request.Subtitle,
            ImageUrl = request.ImageUrl,
            CtaText = request.CtaText,
            CtaUrl = request.CtaUrl,
            ItemsJson = request.ItemsJson,
            Locale = request.Locale,
            SortOrder = request.SortOrder,
            IsPublished = request.IsPublished
        };

        await _repository.AddAsync(block, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return Map(block);
    }

    public async Task<bool> UpdateAsync(int id, HomePageBlockUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var block = await _repository.FindAsync(id, cancellationToken);
        if (block is null)
        {
            return false;
        }

        block.Key = request.Key;
        block.Type = request.Type;
        block.Title = request.Title;
        block.Subtitle = request.Subtitle;
        block.ImageUrl = request.ImageUrl;
        block.CtaText = request.CtaText;
        block.CtaUrl = request.CtaUrl;
        block.ItemsJson = request.ItemsJson;
        block.Locale = request.Locale;
        block.SortOrder = request.SortOrder;
        block.IsPublished = request.IsPublished;

        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var block = await _repository.FindAsync(id, cancellationToken);
        if (block is null)
        {
            return false;
        }

        await _repository.RemoveAsync(block, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static HomePageBlockDto Map(HomePageBlock block)
    {
        return new HomePageBlockDto
        {
            Id = block.Id,
            Key = block.Key,
            Type = block.Type,
            Title = block.Title,
            Subtitle = block.Subtitle,
            ImageUrl = block.ImageUrl,
            CtaText = block.CtaText,
            CtaUrl = block.CtaUrl,
            ItemsJson = block.ItemsJson,
            Locale = block.Locale,
            SortOrder = block.SortOrder,
            IsPublished = block.IsPublished
        };
    }
}
