using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class LearningPathsService
{
    private readonly ILearningPathsRepository _repository;

    public LearningPathsService(ILearningPathsRepository repository)
    {
        _repository = repository;
    }

    public Task<List<LearningPathListDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetPublishedAsync(cancellationToken);
    }

    public async Task<LearningPathDetailDto?> GetBySlugAsync(string slug, bool isAdmin, string? userId, CancellationToken cancellationToken = default)
    {
        var path = await _repository.FindBySlugAsync(slug, cancellationToken);
        if (path is null || (!path.IsPublished && !isAdmin))
        {
            return null;
        }

        var orderedSections = path.Sections
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Id)
            .Select(s => new LearningPathSectionDto
            {
                Id = s.Id,
                LearningPathId = s.LearningPathId,
                Title = s.Title,
                Description = s.Description,
                SortOrder = s.SortOrder
            })
            .ToList();

        var orderedCourses = path.Courses
            .Where(c => c.Course != null && c.Course.IsPublished)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Id)
            .Select(c => new LearningPathCourseDto
            {
                Id = c.Id,
                LearningPathId = c.LearningPathId,
                LearningPathSectionId = c.LearningPathSectionId,
                CourseId = c.CourseId,
                CourseTitle = c.Course?.Title ?? string.Empty,
                CourseSlug = c.Course?.Slug ?? string.Empty,
                CourseThumbnailUrl = c.Course?.ThumbnailUrl ?? string.Empty,
                CourseLevel = c.Course?.Level ?? string.Empty,
                CourseLanguage = c.Course?.Language ?? string.Empty,
                SortOrder = c.SortOrder,
                IsRequired = c.IsRequired
            })
            .ToList();

        var enrolledCourseCount = await _repository.GetEnrolledCourseCountAsync(path.Id, userId, cancellationToken);
        var courseCount = orderedCourses.Count;
        var progressPercent = courseCount > 0 && enrolledCourseCount.HasValue
            ? (int)Math.Round(enrolledCourseCount.Value * 100d / courseCount)
            : (int?)null;

        return new LearningPathDetailDto
        {
            Id = path.Id,
            Title = path.Title,
            Slug = path.Slug,
            Description = path.Description,
            Level = path.Level,
            ThumbnailUrl = path.ThumbnailUrl,
            EstimatedHours = path.EstimatedHours,
            IsPublished = path.IsPublished,
            CourseCount = courseCount,
            EnrolledCourseCount = enrolledCourseCount,
            ProgressPercent = progressPercent,
            Sections = orderedSections,
            Courses = orderedCourses
        };
    }
}
