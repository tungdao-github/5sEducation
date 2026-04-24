using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IInstructorCoursesRepository
{
    Task<List<CourseManageDto>> GetMineAsync(string userId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<Course?> GetDetailAsync(int id, CancellationToken cancellationToken = default);
}

public sealed class InstructorCoursesRepository : IInstructorCoursesRepository
{
    private readonly ApplicationDbContext _db;

    public InstructorCoursesRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<CourseManageDto>> GetMineAsync(string userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var query = _db.Courses
            .AsNoTracking()
            .AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(c => c.InstructorId == userId);
        }

        return await query
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new CourseManageDto
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug,
                Price = c.Price,
                FlashSalePrice = c.FlashSalePrice,
                FlashSaleStartsAt = c.FlashSaleStartsAt,
                FlashSaleEndsAt = c.FlashSaleEndsAt,
                ThumbnailUrl = c.ThumbnailUrl,
                Level = c.Level,
                Language = c.Language,
                IsPublished = c.IsPublished,
                StudentCount = c.Enrollments.Count,
                AverageRating = c.Reviews.Select(r => (double?)r.Rating).Average() ?? 0,
                ReviewCount = c.Reviews.Count,
                Revenue = _db.OrderItems
                    .Where(oi => oi.CourseId == c.Id && oi.Order != null && oi.Order.Status == "paid")
                    .Select(oi => (decimal?)oi.LineTotal)
                    .Sum() ?? 0,
                TotalLessons = c.Lessons.Count,
                UpdatedAt = c.UpdatedAt,
                Category = c.Category == null
                    ? null
                    : new CategoryDto
                    {
                        Id = c.Category.Id,
                        Title = c.Category.Title,
                        Slug = c.Category.Slug
                    },
                InstructorName = c.Instructor == null
                    ? null
                    : (c.Instructor.FirstName + " " + c.Instructor.LastName).Trim(),
                InstructorAvatarUrl = c.Instructor == null ? null : c.Instructor.AvatarUrl
            })
            .ToListAsync(cancellationToken);
    }

    public Task<Course?> GetDetailAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.Courses
            .AsNoTracking()
            .AsSplitQuery()
            .Include(c => c.Category)
            .Include(c => c.Lessons)
            .ThenInclude(l => l.ExerciseQuestions)
            .Include(c => c.Enrollments)
            .Include(c => c.Reviews)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }
}
