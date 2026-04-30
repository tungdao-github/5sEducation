using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class PublicContentService
{
    private readonly IPublicContentRepository _repository;

    public PublicContentService(IPublicContentRepository repository)
    {
        _repository = repository;
    }

    public Task<List<HomePageBlockDto>> GetHomePageBlocksAsync(string? locale, CancellationToken cancellationToken = default)
    {
        return _repository.GetHomePageBlocksAsync(locale, cancellationToken);
    }

    public async Task<List<BlogPostListDto>> GetBlogPostsAsync(string? search, string? tag, string? locale, int? take, CancellationToken cancellationToken = default)
    {
        var posts = await _repository.GetBlogPostsAsync(search, tag, locale, take, cancellationToken);
        return posts.Select(BlogPostMappingHelper.MapList).ToList();
    }

    public async Task<BlogPostDetailDto?> GetBlogPostBySlugAsync(string slug, bool isAdmin, string? locale = null, CancellationToken cancellationToken = default)
    {
        var post = await _repository.FindBlogPostBySlugAsync(slug, locale, cancellationToken);
        if (post is null || (!post.IsPublished && !isAdmin))
        {
            return null;
        }

        return BlogPostMappingHelper.MapDetail(post);
    }

    public async Task<BlogPostDetailDto?> GetBlogPostByIdAsync(int id, string? locale = null, CancellationToken cancellationToken = default)
    {
        var post = await _repository.FindBlogPostByIdAsync(id, locale, cancellationToken);
        return post is null || !post.IsPublished ? null : BlogPostMappingHelper.MapDetail(post);
    }

    public async Task<List<SearchSuggestionDto>> GetSearchSuggestionsAsync(string? query, CancellationToken cancellationToken = default)
    {
        var term = (query ?? string.Empty).Trim();
        if (term.Length < 2)
        {
            return [];
        }

        return await _repository.GetSearchSuggestionsAsync(term, cancellationToken);
    }

    public Task<List<SystemSettingDto>> GetSettingsAsync(string? group, string? keys, CancellationToken cancellationToken = default)
    {
        return _repository.GetSettingsAsync(group, keys, cancellationToken);
    }

    public Task<PublicStatsDto> GetPublicStatsAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetPublicStatsAsync(cancellationToken);
    }

    public Task<List<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetCategoriesAsync(cancellationToken);
    }
}
