using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/instructor/courses")]
[Authorize(Roles = "Admin,Instructor")]
public class InstructorCoursesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public InstructorCoursesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseManageDto>>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole("Admin");
        var query = _db.Courses.Include(c => c.Category).AsQueryable();

        if (!isAdmin)
        {
            query = query.Where(c => c.InstructorId == userId);
        }

        var courses = await query
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
                UpdatedAt = c.UpdatedAt,
                Category = c.Category == null
                    ? null
                    : new CategoryDto
                    {
                        Id = c.Category.Id,
                        Title = c.Category.Title,
                        Slug = c.Category.Slug
                    }
            })
            .ToListAsync();

        return Ok(courses);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourseDetailDto>> GetById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var course = await _db.Courses
            .Include(c => c.Category)
            .Include(c => c.Lessons)
            .ThenInclude(l => l.ExerciseQuestions)
            .Include(c => c.Enrollments)
            .Include(c => c.Reviews)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course is null)
        {
            return NotFound();
        }

        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && course.InstructorId != userId)
        {
            return Forbid();
        }

        var now = DateTime.UtcNow;
        var dto = new CourseDetailDto
        {
            Id = course.Id,
            Title = course.Title,
            Slug = course.Slug,
            ShortDescription = course.ShortDescription,
            Price = course.Price,
            EffectivePrice = GetEffectivePrice(course, now),
            OriginalPrice = GetOriginalPrice(course, now),
            IsFlashSaleActive = IsFlashSaleActive(course, now),
            FlashSalePrice = course.FlashSalePrice,
            FlashSaleStartsAt = course.FlashSaleStartsAt,
            FlashSaleEndsAt = course.FlashSaleEndsAt,
            ThumbnailUrl = course.ThumbnailUrl,
            Language = course.Language,
            Level = course.Level,
            AverageRating = course.Reviews.Count > 0 ? course.Reviews.Average(r => r.Rating) : 0,
            ReviewCount = course.Reviews.Count,
            StudentCount = course.Enrollments.Count,
            Description = course.Description,
            Outcome = course.Outcome,
            Requirements = course.Requirements,
            PreviewVideoUrl = course.PreviewVideoUrl,
            IsPublished = course.IsPublished,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,
            Category = course.Category == null
                ? null
                : new CategoryDto
                {
                    Id = course.Category.Id,
                    Title = course.Category.Title,
                    Slug = course.Category.Slug
                },
            Lessons = course.Lessons
                .OrderBy(l => l.SortOrder)
                .Select(MapLesson)
                .ToList()
        };

        return Ok(dto);
    }

    private static LessonDto MapLesson(Models.Lesson lesson)
    {
        var questions = GetConfiguredExerciseQuestions(lesson);
        var normalizedType = NormalizeLessonContentType(lesson.ContentType, questions.Count > 0);
        var hasExercise = questions.Count > 0 && normalizedType == "exercise";

        return new LessonDto
        {
            Id = lesson.Id,
            CourseId = lesson.CourseId,
            Title = lesson.Title,
            ContentType = normalizedType,
            DurationMinutes = lesson.DurationMinutes,
            VideoUrl = lesson.VideoUrl,
            SortOrder = lesson.SortOrder,
            HasExercise = hasExercise,
            Exercise = hasExercise
                ? new LessonExerciseDto
                {
                    PassingPercent = NormalizePassingPercent(lesson.ExercisePassingPercent),
                    TimeLimitSeconds = NormalizeTimeLimitSeconds(lesson.ExerciseTimeLimitSeconds),
                    MaxTabSwitches = NormalizeMaxTabSwitches(lesson.ExerciseMaxTabSwitches),
                    Questions = questions
                }
                : null
        };
    }

    private static List<LessonExerciseQuestionDto> GetConfiguredExerciseQuestions(Models.Lesson lesson)
    {
        var structuredQuestions = lesson.ExerciseQuestions
            .Where(q =>
                !string.IsNullOrWhiteSpace(q.Question)
                && !string.IsNullOrWhiteSpace(q.OptionA)
                && !string.IsNullOrWhiteSpace(q.OptionB)
                && !string.IsNullOrWhiteSpace(q.OptionC)
                && !string.IsNullOrWhiteSpace(q.OptionD)
                && q.CorrectOption is >= 1 and <= 4)
            .OrderBy(q => q.SortOrder)
            .ThenBy(q => q.Id)
            .Select(q => new LessonExerciseQuestionDto
            {
                Id = q.Id,
                Question = q.Question,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                SortOrder = q.SortOrder
            })
            .ToList();

        if (structuredQuestions.Count > 0)
        {
            return structuredQuestions;
        }

        var hasLegacyQuestion = !string.IsNullOrWhiteSpace(lesson.ExerciseQuestion)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionA)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionB)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionC)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionD)
            && lesson.ExerciseCorrectOption is >= 1 and <= 4;

        if (!hasLegacyQuestion)
        {
            return [];
        }

        return
        [
            new LessonExerciseQuestionDto
            {
                Id = 1,
                Question = lesson.ExerciseQuestion,
                OptionA = lesson.ExerciseOptionA,
                OptionB = lesson.ExerciseOptionB,
                OptionC = lesson.ExerciseOptionC,
                OptionD = lesson.ExerciseOptionD,
                SortOrder = 1
            }
        ];
    }

    private static int NormalizePassingPercent(int passingPercent)
    {
        if (passingPercent < 1)
        {
            return 80;
        }

        return Math.Min(100, passingPercent);
    }

    private static int NormalizeTimeLimitSeconds(int timeLimitSeconds)
    {
        return Math.Clamp(timeLimitSeconds, 0, 7200);
    }

    private static int NormalizeMaxTabSwitches(int maxTabSwitches)
    {
        return Math.Clamp(maxTabSwitches, 0, 20);
    }

    private static string NormalizeLessonContentType(string? contentTypeInput, bool fallbackToExercise)
    {
        var normalized = (contentTypeInput ?? string.Empty).Trim().ToLowerInvariant();
        if (normalized == "exercise")
        {
            return "exercise";
        }

        if (fallbackToExercise)
        {
            return "exercise";
        }

        return "video";
    }

    private static bool IsFlashSaleActive(Models.Course course, DateTime now)
    {
        if (!course.FlashSalePrice.HasValue || course.FlashSalePrice.Value <= 0)
        {
            return false;
        }

        if (course.FlashSalePrice.Value >= course.Price)
        {
            return false;
        }

        if (course.FlashSaleStartsAt.HasValue && now < course.FlashSaleStartsAt.Value)
        {
            return false;
        }

        if (course.FlashSaleEndsAt.HasValue && now > course.FlashSaleEndsAt.Value)
        {
            return false;
        }

        return true;
    }

    private static decimal GetEffectivePrice(Models.Course course, DateTime now)
    {
        return IsFlashSaleActive(course, now)
            ? course.FlashSalePrice ?? course.Price
            : course.Price;
    }

    private static decimal? GetOriginalPrice(Models.Course course, DateTime now)
    {
        return IsFlashSaleActive(course, now) ? course.Price : null;
    }
}
