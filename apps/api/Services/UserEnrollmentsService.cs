using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class UserEnrollmentsService
{
    private readonly IUserEnrollmentsRepository _repository;

    public UserEnrollmentsService(IUserEnrollmentsRepository repository)
    {
        _repository = repository;
    }

    public Task<List<EnrollmentDto>> GetMineAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _repository.GetMineAsync(userId, cancellationToken);
    }

    public async Task<AdminCrudResult<object?>> EnrollAsync(string userId, EnrollRequest request, CancellationToken cancellationToken = default)
    {
        if (!await _repository.CourseExistsAsync(request.CourseId, cancellationToken))
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (!await _repository.IsCoursePublishedAsync(request.CourseId, cancellationToken))
        {
            return AdminCrudResult<object?>.NotFound();
        }

        if (await _repository.ExistsAsync(userId, request.CourseId, cancellationToken))
        {
            return AdminCrudResult<object?>.Conflict("Already enrolled.");
        }

        await _repository.AddAsync(new Enrollment
        {
            UserId = userId,
            CourseId = request.CourseId,
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        await _repository.SaveChangesAsync(cancellationToken);
        return AdminCrudResult<object?>.Success();
    }
}
