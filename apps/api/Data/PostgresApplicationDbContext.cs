using Microsoft.EntityFrameworkCore;

namespace UdemyClone.Api.Data;

public class PostgresApplicationDbContext : ApplicationDbContext
{
    public PostgresApplicationDbContext(DbContextOptions<PostgresApplicationDbContext> options) : base(options)
    {
    }
}
