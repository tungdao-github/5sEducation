using UdemyClone.Api.Repositories;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public sealed record CourseCatalogQuery(
    string? Search,
    string? Category,
    string? Level,
    string? Language,
    decimal? MinPrice,
    decimal? MaxPrice,
    double? MinRating,
    string? Sort,
    int? Page,
    int? PageSize);

public sealed class CourseCatalogResult
{
    public List<CourseListDto> Items { get; init; } = [];

    public int? TotalCount { get; init; }
}

public sealed class CourseCatalogPage
{
    public List<CourseSummaryProjection> Items { get; init; } = [];

    public int? TotalCount { get; init; }
}

public enum CourseMutationStatus
{
    Success = 0,
    BadRequest = 1,
    NotFound = 2,
    Forbidden = 3
}

public sealed class CourseMutationResult
{
    public CourseMutationStatus Status { get; init; }

    public string? Error { get; init; }

    public CourseDetailDto? Course { get; init; }

    public static CourseMutationResult Success(CourseDetailDto? course = null)
    {
        return new CourseMutationResult
        {
            Status = CourseMutationStatus.Success,
            Course = course
        };
    }

    public static CourseMutationResult BadRequest(string error)
    {
        return new CourseMutationResult
        {
            Status = CourseMutationStatus.BadRequest,
            Error = error
        };
    }

    public static CourseMutationResult NotFound(string error = "Course not found.")
    {
        return new CourseMutationResult
        {
            Status = CourseMutationStatus.NotFound,
            Error = error
        };
    }

    public static CourseMutationResult Forbidden(string error = "Forbidden.")
    {
        return new CourseMutationResult
        {
            Status = CourseMutationStatus.Forbidden,
            Error = error
        };
    }
}
