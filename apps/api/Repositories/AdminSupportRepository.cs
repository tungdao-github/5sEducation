using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IAdminSupportRepository
{
    Task<List<SupportMessageDto>> GetAllAsync(string? status, CancellationToken cancellationToken = default);
    Task<SupportMessage?> FindByIdAsync(int id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class AdminSupportRepository : IAdminSupportRepository
{
    private readonly ApplicationDbContext _db;

    public AdminSupportRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<SupportMessageDto>> GetAllAsync(string? status, CancellationToken cancellationToken = default)
    {
        var query = _db.SupportMessages.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(m => m.Status == status);
        }

        return await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new SupportMessageDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserEmail = m.User != null ? m.User.Email : null,
                Name = m.Name,
                Email = m.Email,
                Message = m.Message,
                Status = m.Status,
                AdminNote = m.AdminNote,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task<SupportMessage?> FindByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _db.SupportMessages.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
