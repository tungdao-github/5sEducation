using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class UserProgressService
{
    private readonly IUserProgressRepository _repository;

    public UserProgressService(IUserProgressRepository repository)
    {
        _repository = repository;
    }

    public async Task<ProgressSnapshotDto?> GetProgressAsync(string userId, int courseId, CancellationToken cancellationToken = default)
    {
        var enrollment = await _repository.GetEnrollmentSnapshotAsync(userId, courseId, cancellationToken);
        if (enrollment is null)
        {
            return null;
        }

        var completed = await _repository.GetCompletedLessonIdsAsync(enrollment.Value.EnrollmentId, cancellationToken);
        var total = await _repository.GetTotalLessonsAsync(enrollment.Value.CourseId, cancellationToken);
        return BuildSnapshot(enrollment.Value.CourseId, enrollment.Value.LastLessonId, total, completed);
    }

    public async Task<AdminCrudResult<ProgressSnapshotDto>> UpdateProgressAsync(string userId, ProgressUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var enrollment = await _repository.GetEnrollmentForUpdateAsync(userId, request.CourseId, cancellationToken);
        if (enrollment is null)
        {
            return AdminCrudResult<ProgressSnapshotDto>.NotFound();
        }

        if (!await _repository.LessonBelongsToCourseAsync(request.LessonId, request.CourseId, cancellationToken))
        {
            return AdminCrudResult<ProgressSnapshotDto>.BadRequest("Lesson does not belong to this course.");
        }

        if (request.SetAsLast)
        {
            enrollment.LastLessonId = request.LessonId;
            enrollment.UpdatedAt = DateTime.UtcNow;
        }

        if (request.IsCompleted.HasValue)
        {
            var existing = enrollment.LessonProgresses.FirstOrDefault(lp => lp.LessonId == request.LessonId);
            if (request.IsCompleted.Value)
            {
                if (existing is null)
                {
                    enrollment.LessonProgresses.Add(new LessonProgress
                    {
                        EnrollmentId = enrollment.Id,
                        LessonId = request.LessonId,
                        CompletedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    existing.CompletedAt = DateTime.UtcNow;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
            }
            else if (existing is not null)
            {
                enrollment.LessonProgresses.Remove(existing);
            }
        }

        await _repository.SaveChangesAsync(cancellationToken);
        var snapshot = await GetProgressAsync(userId, request.CourseId, cancellationToken);
        return snapshot is null
            ? AdminCrudResult<ProgressSnapshotDto>.BadRequest("Unable to build progress snapshot.")
            : AdminCrudResult<ProgressSnapshotDto>.Success(snapshot);
    }

    private static ProgressSnapshotDto BuildSnapshot(int courseId, int? lastLessonId, int totalLessons, List<int> completedLessonIds)
    {
        var progressPercent = totalLessons == 0 ? 0 : Math.Round(completedLessonIds.Count * 100d / totalLessons, 1);
        return new ProgressSnapshotDto
        {
            CourseId = courseId,
            LastLessonId = lastLessonId,
            TotalLessons = totalLessons,
            CompletedLessons = completedLessonIds.Count,
            ProgressPercent = progressPercent,
            CompletedLessonIds = completedLessonIds
        };
    }
}
