using Microsoft.EntityFrameworkCore;
using UdemyClone.Api.Data;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Repositories;

public interface IUserAddressesRepository
{
    Task<List<UserAddressDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> HasAnyAsync(string userId, CancellationToken cancellationToken = default);
    Task<UserAddress?> FindAsync(int id, string userId, CancellationToken cancellationToken = default);
    Task<List<UserAddress>> GetAllEntitiesAsync(string userId, CancellationToken cancellationToken = default);
    Task AddAsync(UserAddress address, CancellationToken cancellationToken = default);
    Task RemoveAsync(UserAddress address, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class UserAddressesRepository : IUserAddressesRepository
{
    private readonly ApplicationDbContext _db;

    public UserAddressesRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<UserAddressDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _db.UserAddresses
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.UpdatedAt)
            .Select(a => new UserAddressDto
            {
                Id = a.Id,
                Label = a.Label,
                RecipientName = a.RecipientName,
                Phone = a.Phone,
                Line1 = a.Line1,
                Line2 = a.Line2,
                City = a.City,
                State = a.State,
                PostalCode = a.PostalCode,
                Country = a.Country,
                IsDefault = a.IsDefault,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public Task<bool> HasAnyAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _db.UserAddresses.AnyAsync(a => a.UserId == userId, cancellationToken);
    }

    public Task<UserAddress?> FindAsync(int id, string userId, CancellationToken cancellationToken = default)
    {
        return _db.UserAddresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId, cancellationToken);
    }

    public async Task<List<UserAddress>> GetAllEntitiesAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _db.UserAddresses
            .Where(a => a.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public Task AddAsync(UserAddress address, CancellationToken cancellationToken = default)
    {
        _db.UserAddresses.Add(address);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(UserAddress address, CancellationToken cancellationToken = default)
    {
        _db.UserAddresses.Remove(address);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
