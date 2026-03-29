using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/courses")]
public class CoursesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IWebHostEnvironment _env;

    public CoursesController(ApplicationDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? level,
        [FromQuery] string? language,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] double? minRating,
        [FromQuery] string? sort,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var query = _db.Courses
            .Include(c => c.Category)
            .Where(c => c.IsPublished)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Title.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(c => c.Category != null && c.Category.Slug == category);
        }

        if (!string.IsNullOrWhiteSpace(level))
        {
            query = query.Where(c => c.Level == level);
        }

        if (!string.IsNullOrWhiteSpace(language))
        {
            query = query.Where(c => c.Language == language);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(c => c.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(c => c.Price <= maxPrice.Value);
        }

        var projected = query
            .Select(c => new
            {
                Course = c,
                AverageRating = c.Reviews.Select(r => (double?)r.Rating).Average() ?? 0,
                ReviewCount = c.Reviews.Count,
                StudentCount = c.Enrollments.Count
            });

        if (minRating.HasValue)
        {
            projected = projected.Where(c => c.AverageRating >= minRating.Value);
        }

        projected = (sort ?? string.Empty).ToLowerInvariant() switch
        {
            "rating" => projected.OrderByDescending(c => c.AverageRating),
            "price_asc" => projected.OrderBy(c => c.Course.Price),
            "price_desc" => projected.OrderByDescending(c => c.Course.Price),
            "popular" => projected.OrderByDescending(c => c.StudentCount),
            _ => projected.OrderByDescending(c => c.Course.CreatedAt)
        };

        var resolvedPageSize = pageSize ?? 0;
        var resolvedPage = page ?? 0;
        if (resolvedPageSize > 0 || resolvedPage > 0)
        {
            resolvedPageSize = Math.Clamp(resolvedPageSize == 0 ? 12 : resolvedPageSize, 1, 60);
            resolvedPage = Math.Max(1, resolvedPage == 0 ? 1 : resolvedPage);

            var total = await projected.CountAsync();
            Response.Headers["X-Total-Count"] = total.ToString();

            projected = projected
                .Skip((resolvedPage - 1) * resolvedPageSize)
                .Take(resolvedPageSize);
        }

        var rawCourses = await projected.ToListAsync();
        var now = DateTime.UtcNow;
        var courses = rawCourses
            .Select(c => MapCourseList(c.Course, c.AverageRating, c.ReviewCount, c.StudentCount, now))
            .ToList();

        return Ok(courses);
    }

    [HttpGet("compare")]
    public async Task<ActionResult<List<CourseCompareDto>>> Compare([FromQuery] string? ids)
    {
        if (string.IsNullOrWhiteSpace(ids))
        {
            return Ok(new List<CourseCompareDto>());
        }

        var idList = ids
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(value => int.TryParse(value, out var id) ? id : 0)
            .Where(id => id > 0)
            .Distinct()
            .Take(4)
            .ToList();

        if (idList.Count == 0)
        {
            return Ok(new List<CourseCompareDto>());
        }

        var rawCourses = await _db.Courses
            .Include(c => c.Category)
            .Include(c => c.Reviews)
            .Include(c => c.Enrollments)
            .Where(c => c.IsPublished && idList.Contains(c.Id))
            .ToListAsync();

        var now = DateTime.UtcNow;
        var courses = rawCourses
            .Select(c => new CourseCompareDto
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug,
                ShortDescription = c.ShortDescription,
                Description = c.Description,
                Outcome = c.Outcome,
                Requirements = c.Requirements,
                Price = c.Price,
                EffectivePrice = GetEffectivePrice(c, now),
                OriginalPrice = GetOriginalPrice(c, now),
                IsFlashSaleActive = IsFlashSaleActive(c, now),
                FlashSalePrice = c.FlashSalePrice,
                FlashSaleEndsAt = c.FlashSaleEndsAt,
                ThumbnailUrl = c.ThumbnailUrl,
                Language = c.Language,
                Level = c.Level,
                AverageRating = c.Reviews.Count > 0 ? c.Reviews.Average(r => r.Rating) : 0,
                ReviewCount = c.Reviews.Count,
                StudentCount = c.Enrollments.Count,
                Category = c.Category == null ? null : new CategoryDto
                {
                    Id = c.Category.Id,
                    Title = c.Category.Title,
                    Slug = c.Category.Slug
                }
            })
            .ToList();

        var ordered = courses
            .OrderBy(c => idList.IndexOf(c.Id))
            .ToList();

        return Ok(ordered);
    }

    [HttpGet("{slug}/related")]
    public async Task<ActionResult<List<CourseListDto>>> GetRelated(string slug, [FromQuery] int? take)
    {
        var course = await _db.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsPublished);
        if (course is null)
        {
            return NotFound();
        }

        var limit = Math.Clamp(take ?? 6, 1, 12);

        var query = _db.Courses
            .Include(c => c.Category)
            .Where(c => c.IsPublished && c.Id != course.Id)
            .AsNoTracking()
            .AsQueryable();

        if (course.CategoryId.HasValue)
        {
            query = query.Where(c => c.CategoryId == course.CategoryId);
        }
        else
        {
            query = query.Where(c => c.Level == course.Level);
        }

        var rawResults = await query
            .Select(c => new
            {
                Course = c,
                AverageRating = c.Reviews.Select(r => (double?)r.Rating).Average() ?? 0,
                ReviewCount = c.Reviews.Count,
                StudentCount = c.Enrollments.Count
            })
            .OrderByDescending(c => c.AverageRating)
            .ThenByDescending(c => c.Course.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var results = rawResults
            .Select(c => MapCourseList(c.Course, c.AverageRating, c.ReviewCount, c.StudentCount, now))
            .ToList();

        return Ok(results);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<CourseDetailDto>> GetBySlug(string slug)
    {
        var course = await _db.Courses
            .Include(c => c.Category)
            .Include(c => c.Lessons)
            .ThenInclude(l => l.ExerciseQuestions)
            .Include(c => c.Enrollments)
            .Include(c => c.Reviews)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (course is null)
        {
            return NotFound();
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        var isInstructor = !string.IsNullOrWhiteSpace(userId) && course.InstructorId == userId;

        if (!course.IsPublished)
        {
            if (!isAdmin && !isInstructor)
            {
                return NotFound();
            }
        }

        var isEnrolled = false;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            isEnrolled = await _db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == course.Id);
        }

        var canAccessContent = isAdmin || isInstructor || isEnrolled;

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
            Category = course.Category == null ? null : new CategoryDto
            {
                Id = course.Category.Id,
                Title = course.Category.Title,
                Slug = course.Category.Slug
            },
            Lessons = course.Lessons
                .OrderBy(l => l.SortOrder)
                .Select(lesson => MapLesson(lesson, canAccessContent))
                .ToList()
        };

        return Ok(dto);
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpPost]
    public async Task<ActionResult<CourseDetailDto>> Create([FromForm] CourseCreateRequest request)
    {
        var instructorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(instructorId))
        {
            return Unauthorized();
        }

        var slug = SlugHelper.Slugify(request.Title);
        var (thumbnailUrl, thumbnailError) = await SaveThumbnailAsync(request.Thumbnail);
        if (!string.IsNullOrWhiteSpace(thumbnailError))
        {
            return BadRequest(thumbnailError);
        }

        var flashSalePrice = NormalizeFlashSalePrice(request.Price, request.FlashSalePrice);
        var (flashStart, flashEnd) = NormalizeFlashSaleWindow(request.FlashSaleStartsAt, request.FlashSaleEndsAt);

        var course = new Course
        {
            Title = request.Title,
            Slug = slug,
            InstructorId = instructorId,
            CategoryId = request.CategoryId,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            Outcome = request.Outcome,
            Requirements = request.Requirements,
            Language = request.Language,
            Price = request.Price,
            FlashSalePrice = flashSalePrice,
            FlashSaleStartsAt = flashStart,
            FlashSaleEndsAt = flashEnd,
            Level = request.Level,
            PreviewVideoUrl = request.PreviewVideoUrl,
            ThumbnailUrl = thumbnailUrl ?? string.Empty,
            IsPublished = request.IsPublished,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Courses.Add(course);
        await _db.SaveChangesAsync();

        var now = DateTime.UtcNow;
        return CreatedAtAction(nameof(GetBySlug), new { slug = course.Slug }, new CourseDetailDto
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
            AverageRating = 0,
            ReviewCount = 0,
            StudentCount = 0,
            Description = course.Description,
            Outcome = course.Outcome,
            Requirements = course.Requirements,
            PreviewVideoUrl = course.PreviewVideoUrl,
            IsPublished = course.IsPublished,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt
        });
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] CourseUpdateRequest request)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course is null)
        {
            return NotFound();
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && course.InstructorId != userId)
        {
            return Forbid();
        }

        course.Title = request.Title;
        course.Slug = SlugHelper.Slugify(request.Title);
        course.CategoryId = request.CategoryId;
        course.ShortDescription = request.ShortDescription;
        course.Description = request.Description;
        course.Outcome = request.Outcome;
        course.Requirements = request.Requirements;
        course.Language = request.Language;
        course.Price = request.Price;
        course.FlashSalePrice = NormalizeFlashSalePrice(request.Price, request.FlashSalePrice);
        var (flashStart, flashEnd) = NormalizeFlashSaleWindow(request.FlashSaleStartsAt, request.FlashSaleEndsAt);
        course.FlashSaleStartsAt = flashStart;
        course.FlashSaleEndsAt = flashEnd;
        course.Level = request.Level;
        course.PreviewVideoUrl = request.PreviewVideoUrl;
        course.IsPublished = request.IsPublished;
        course.UpdatedAt = DateTime.UtcNow;

        var (thumbnailUrl, thumbnailError) = await SaveThumbnailAsync(request.Thumbnail);
        if (!string.IsNullOrWhiteSpace(thumbnailError))
        {
            return BadRequest(thumbnailError);
        }

        if (!string.IsNullOrWhiteSpace(thumbnailUrl))
        {
            course.ThumbnailUrl = thumbnailUrl;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin,Instructor")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course is null)
        {
            return NotFound();
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && course.InstructorId != userId)
        {
            return Forbid();
        }

        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<(string? url, string? error)> SaveThumbnailAsync(IFormFile? file)
    {
        if (file is null || file.Length == 0)
        {
            return (null, null);
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif"
        };

        var looksLikeImage = (!string.IsNullOrWhiteSpace(file.ContentType)
                              && file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                             || allowedExtensions.Contains(extension);

        if (!looksLikeImage)
        {
            return (null, "Only image files are supported for thumbnails.");
        }

        var maxBytes = 5 * 1024 * 1024;
        if (file.Length > maxBytes)
        {
            return (null, "Thumbnail must be 5MB or smaller.");
        }

        var webRoot = string.IsNullOrWhiteSpace(_env.WebRootPath)
            ? Path.Combine(_env.ContentRootPath, "wwwroot")
            : _env.WebRootPath;

        var uploadsFolder = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return ($"/uploads/{fileName}", null);
    }

    private static LessonDto MapLesson(Lesson lesson, bool canAccessContent)
    {
        var normalizedType = NormalizeLessonContentType(lesson.ContentType, fallbackToExercise: false);

        if (!canAccessContent)
        {
            return new LessonDto
            {
                Id = lesson.Id,
                CourseId = lesson.CourseId,
                Title = lesson.Title,
                ContentType = normalizedType,
                DurationMinutes = lesson.DurationMinutes,
                VideoUrl = string.Empty,
                SortOrder = lesson.SortOrder,
                HasExercise = false,
                Exercise = null
            };
        }

        var questions = GetConfiguredExerciseQuestions(lesson);
        normalizedType = NormalizeLessonContentType(lesson.ContentType, questions.Count > 0);
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

    private static List<LessonExerciseQuestionDto> GetConfiguredExerciseQuestions(Lesson lesson)
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

    private static CourseListDto MapCourseList(Course course, double averageRating, int reviewCount, int studentCount, DateTime now)
    {
        return new CourseListDto
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
            AverageRating = averageRating,
            ReviewCount = reviewCount,
            StudentCount = studentCount,
            Category = course.Category == null ? null : new CategoryDto
            {
                Id = course.Category.Id,
                Title = course.Category.Title,
                Slug = course.Category.Slug
            }
        };
    }

    private static bool IsFlashSaleActive(Course course, DateTime now)
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

    private static decimal GetEffectivePrice(Course course, DateTime now)
    {
        return IsFlashSaleActive(course, now)
            ? course.FlashSalePrice ?? course.Price
            : course.Price;
    }

    private static decimal? GetOriginalPrice(Course course, DateTime now)
    {
        return IsFlashSaleActive(course, now) ? course.Price : null;
    }

    private static decimal? NormalizeFlashSalePrice(decimal price, decimal? flashSalePrice)
    {
        if (!flashSalePrice.HasValue)
        {
            return null;
        }

        var value = flashSalePrice.Value;
        if (value <= 0 || value >= price)
        {
            return null;
        }

        return value;
    }

    private static (DateTime? start, DateTime? end) NormalizeFlashSaleWindow(DateTime? start, DateTime? end)
    {
        if (start.HasValue && end.HasValue && start.Value > end.Value)
        {
            return (null, null);
        }

        return (start, end);
    }
}
