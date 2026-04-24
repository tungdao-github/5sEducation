using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Repositories;

public interface ICourseCatalogRepository
{
    Task<CourseCatalogPage> GetAllAsync(CourseCatalogQuery query, CancellationToken cancellationToken = default);
    Task<List<CourseSummaryProjection>> CompareAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<List<CourseSummaryProjection>> GetRelatedAsync(int courseId, int? categoryId, string level, int take, CancellationToken cancellationToken = default);
    Task<Course?> GetPublishedBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Course?> GetDetailBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Course?> FindByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> IsUserEnrolledAsync(string userId, int courseId, CancellationToken cancellationToken = default);
    Task AddAsync(Course course, CancellationToken cancellationToken = default);
    void Remove(Course course);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class CourseCatalogRepository : ICourseCatalogRepository
{
    private readonly ApplicationDbContext _db;

    public CourseCatalogRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<CourseCatalogPage> GetAllAsync(CourseCatalogQuery query, CancellationToken cancellationToken = default)
    {
        var courses = _db.Courses
            .Where(c => c.IsPublished)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            courses = courses.Where(c => c.Title.Contains(query.Search));
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            courses = courses.Where(c => c.Category != null && c.Category.Slug == query.Category);
        }

        if (!string.IsNullOrWhiteSpace(query.Level))
        {
            courses = courses.Where(c => c.Level == query.Level);
        }

        if (!string.IsNullOrWhiteSpace(query.Language))
        {
            courses = courses.Where(c => c.Language == query.Language);
        }

        if (query.MinPrice.HasValue)
        {
            courses = courses.Where(c => c.Price >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            courses = courses.Where(c => c.Price <= query.MaxPrice.Value);
        }

        var projected = SelectCourseSummaries(courses);

        if (query.MinRating.HasValue)
        {
            projected = projected.Where(c => c.AverageRating >= query.MinRating.Value);
        }

        projected = (query.Sort ?? string.Empty).ToLowerInvariant() switch
        {
            "rating" => projected.OrderByDescending(c => c.AverageRating),
            "price_asc" => projected.OrderBy(c => c.Price),
            "price_desc" => projected.OrderByDescending(c => c.Price),
            "popular" => projected.OrderByDescending(c => c.StudentCount),
            _ => projected.OrderByDescending(c => c.CreatedAt)
        };

        var resolvedPageSize = query.PageSize ?? 0;
        var resolvedPage = query.Page ?? 0;
        int? totalCount = null;

        if (resolvedPageSize > 0 || resolvedPage > 0)
        {
            resolvedPageSize = Math.Clamp(resolvedPageSize == 0 ? 12 : resolvedPageSize, 1, 60);
            resolvedPage = Math.Max(1, resolvedPage == 0 ? 1 : resolvedPage);

            totalCount = await projected.CountAsync(cancellationToken);
            projected = projected
                .Skip((resolvedPage - 1) * resolvedPageSize)
                .Take(resolvedPageSize);
        }

        return new CourseCatalogPage
        {
            Items = await projected.ToListAsync(cancellationToken),
            TotalCount = totalCount
        };
    }

    public async Task<List<CourseSummaryProjection>> CompareAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default)
    {
        if (ids.Count == 0)
        {
            return [];
        }

        var idList = ids.Distinct().Take(4).ToList();
        var rawCourses = await SelectCourseSummaries(_db.Courses
                .AsNoTracking()
                .Where(c => c.IsPublished && idList.Contains(c.Id)))
            .ToListAsync(cancellationToken);

        return rawCourses
            .OrderBy(course => idList.IndexOf(course.Id))
            .ToList();
    }

    public async Task<List<CourseSummaryProjection>> GetRelatedAsync(int courseId, int? categoryId, string level, int take, CancellationToken cancellationToken = default)
    {
        var relatedQuery = _db.Courses
            .Where(c => c.IsPublished && c.Id != courseId)
            .AsNoTracking()
            .AsQueryable();

        if (categoryId.HasValue)
        {
            relatedQuery = relatedQuery.Where(c => c.CategoryId == categoryId);
        }
        else
        {
            relatedQuery = relatedQuery.Where(c => c.Level == level);
        }

        return await SelectCourseSummaries(relatedQuery)
            .OrderByDescending(c => c.AverageRating)
            .ThenByDescending(c => c.CreatedAt)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public Task<Course?> GetPublishedBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return _db.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsPublished, cancellationToken);
    }

    public Task<Course?> GetDetailBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return _db.Courses
            .AsNoTracking()
            .AsSplitQuery()
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Include(c => c.Lessons)
            .ThenInclude(l => l.ExerciseQuestions)
            .Include(c => c.Enrollments)
            .Include(c => c.Reviews)
            .FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
    }

    public Task<Course?> FindByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Courses.FindAsync([id], cancellationToken).AsTask();
    }

    public Task<bool> IsUserEnrolledAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        return _db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId, cancellationToken);
    }

    public Task AddAsync(Course course, CancellationToken cancellationToken = default)
    {
        _db.Courses.Add(course);
        return Task.CompletedTask;
    }

    public void Remove(Course course)
    {
        _db.Courses.Remove(course);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<CourseSummaryProjection> SelectCourseSummaries(IQueryable<Course> query)
    {
        return query.Select(c => new CourseSummaryProjection
        {
            Id = c.Id,
            Title = c.Title,
            Slug = c.Slug,
            ShortDescription = c.ShortDescription,
            Description = c.Description,
            Outcome = c.Outcome,
            Requirements = c.Requirements,
            Price = c.Price,
            FlashSalePrice = c.FlashSalePrice,
            FlashSaleStartsAt = c.FlashSaleStartsAt,
            FlashSaleEndsAt = c.FlashSaleEndsAt,
            ThumbnailUrl = c.ThumbnailUrl,
            Language = c.Language,
            Level = c.Level,
            CreatedAt = c.CreatedAt,
            CategoryId = c.CategoryId,
            CategoryTitle = c.Category == null ? null : c.Category.Title,
            CategorySlug = c.Category == null ? null : c.Category.Slug,
            AverageRating = c.Reviews.Select(r => (double?)r.Rating).Average() ?? 0,
            ReviewCount = c.Reviews.Count,
            StudentCount = c.Enrollments.Count,
            InstructorName = c.Instructor == null
                ? string.Empty
                : (c.Instructor.FirstName + " " + c.Instructor.LastName).Trim(),
            InstructorAvatarUrl = c.Instructor == null ? null : c.Instructor.AvatarUrl,
            TotalLessons = c.Lessons.Count,
            TotalDurationMinutes = c.Lessons.Sum(l => (int?)l.DurationMinutes) ?? 0
        });
    }
}

public sealed class CourseSummaryProjection
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Outcome { get; init; } = string.Empty;
    public string Requirements { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal? FlashSalePrice { get; init; }
    public DateTime? FlashSaleStartsAt { get; init; }
    public DateTime? FlashSaleEndsAt { get; init; }
    public string ThumbnailUrl { get; init; } = string.Empty;
    public string Language { get; init; } = string.Empty;
    public string Level { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public int? CategoryId { get; init; }
    public string? CategoryTitle { get; init; }
    public string? CategorySlug { get; init; }
    public double AverageRating { get; init; }
    public int ReviewCount { get; init; }
    public int StudentCount { get; init; }
    public string InstructorName { get; init; } = string.Empty;
    public string? InstructorAvatarUrl { get; init; }
    public int TotalLessons { get; init; }
    public int TotalDurationMinutes { get; init; }
}
