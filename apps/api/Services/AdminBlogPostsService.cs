using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public enum AdminCrudStatus
{
    Success = 0,
    NotFound = 1,
    BadRequest = 2,
    Conflict = 3,
    Forbidden = 4
}

public sealed class AdminCrudResult<T>
{
    public AdminCrudStatus Status { get; init; }
    public T? Value { get; init; }
    public string? Error { get; init; }

    public static AdminCrudResult<T> Success(T? value = default) => new() { Status = AdminCrudStatus.Success, Value = value };
    public static AdminCrudResult<T> NotFound() => new() { Status = AdminCrudStatus.NotFound };
    public static AdminCrudResult<T> BadRequest(string error) => new() { Status = AdminCrudStatus.BadRequest, Error = error };
    public static AdminCrudResult<T> Conflict(string error) => new() { Status = AdminCrudStatus.Conflict, Error = error };
    public static AdminCrudResult<T> Forbidden(string error = "Forbidden") => new() { Status = AdminCrudStatus.Forbidden, Error = error };
}

public class AdminBlogPostsService
{
    private readonly IAdminBlogPostsRepository _repository;

    public AdminBlogPostsService(IAdminBlogPostsRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<BlogPostListDto>> GetAllAsync(string? search, string? locale, string? status, CancellationToken cancellationToken = default)
    {
        var posts = await _repository.GetAllAsync(search, locale, status, cancellationToken);
        return posts.Select(BlogPostMappingHelper.MapList).ToList();
    }

    public async Task<AdminCrudResult<BlogPostDetailDto>> CreateAsync(BlogPostCreateRequest request, CancellationToken cancellationToken = default)
    {
        var draft = BlogPostDraftHelper.BuildDraft(request);
        if (draft is null)
        {
            return AdminCrudResult<BlogPostDetailDto>.BadRequest("Title, summary, and content are required.");
        }

        if (await _repository.SlugExistsAsync(draft.Slug, cancellationToken: cancellationToken))
        {
            return AdminCrudResult<BlogPostDetailDto>.Conflict("Slug already exists.");
        }

        var now = DateTime.UtcNow;
        var post = new BlogPost
        {
            Title = draft.Title,
            Slug = draft.Slug,
            Summary = draft.Summary,
            Content = draft.Content,
            CoverImageUrl = draft.CoverImageUrl ?? string.Empty,
            AuthorName = draft.AuthorName ?? string.Empty,
            TagsCsv = draft.TagsCsv ?? string.Empty,
            Locale = draft.Locale,
            SeoTitle = draft.SeoTitle ?? string.Empty,
            SeoDescription = draft.SeoDescription ?? string.Empty,
            IsPublished = draft.IsPublished,
            PublishedAt = draft.PublishedAt,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(post, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<BlogPostDetailDto>.Success(BlogPostMappingHelper.MapDetail(post));
    }

    public async Task<AdminCrudResult<BlogPostDetailDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var post = await _repository.FindByIdAsync(id, cancellationToken);
        return post is null
            ? AdminCrudResult<BlogPostDetailDto>.NotFound()
            : AdminCrudResult<BlogPostDetailDto>.Success(BlogPostMappingHelper.MapDetail(post));
    }

    public async Task<AdminCrudResult<object?>> UpdateAsync(int id, BlogPostUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var post = await _repository.FindByIdAsync(id, cancellationToken);
        if (post is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        var draft = BlogPostDraftHelper.BuildDraft(request);
        if (draft is null)
        {
            return AdminCrudResult<object?>.BadRequest("Title, summary, and content are required.");
        }

        if (await _repository.SlugExistsAsync(draft.Slug, id, cancellationToken))
        {
            return AdminCrudResult<object?>.Conflict("Slug already exists.");
        }

        post.Title = draft.Title;
        post.Slug = draft.Slug;
        post.Summary = draft.Summary;
        post.Content = draft.Content;
        post.CoverImageUrl = draft.CoverImageUrl ?? string.Empty;
        post.AuthorName = draft.AuthorName ?? string.Empty;
        post.TagsCsv = draft.TagsCsv ?? string.Empty;
        post.Locale = draft.Locale;
        post.SeoTitle = draft.SeoTitle ?? string.Empty;
        post.SeoDescription = draft.SeoDescription ?? string.Empty;
        post.IsPublished = draft.IsPublished;
        post.PublishedAt = draft.PublishedAt;
        post.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

    public async Task<AdminCrudResult<object?>> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var post = await _repository.FindByIdAsync(id, cancellationToken);
        if (post is null)
        {
            return AdminCrudResult<object?>.NotFound();
        }

        await _repository.RemoveAsync(post, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }

}
