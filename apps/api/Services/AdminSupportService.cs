using UdemyClone.Api.Dtos;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class AdminSupportService
{
    private readonly IAdminSupportRepository _repository;

    public AdminSupportService(IAdminSupportRepository repository)
    {
        _repository = repository;
    }

    public Task<List<SupportMessageDto>> GetAllAsync(string? status, CancellationToken cancellationToken = default)
    {
        return _repository.GetAllAsync(status, cancellationToken);
    }

    public async Task<AdminCrudResult<SupportMessageDto>> UpdateAsync(int id, SupportMessageAdminUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var message = await _repository.FindByIdAsync(id, cancellationToken);
        if (message is null)
        {
            return AdminCrudResult<SupportMessageDto>.NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            message.Status = request.Status.Trim();
        }

        if (request.AdminNote != null)
        {
            message.AdminNote = request.AdminNote.Trim();
        }

        message.UpdatedAt = DateTime.UtcNow;
        await _repository.SaveChangesAsync(cancellationToken);

        return AdminCrudResult<SupportMessageDto>.Success(new SupportMessageDto
        {
            Id = message.Id,
            UserId = message.UserId,
            UserEmail = message.User?.Email,
            Name = message.Name,
            Email = message.Email,
            Message = message.Message,
            Status = message.Status,
            AdminNote = message.AdminNote,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt
        });
    }
}
