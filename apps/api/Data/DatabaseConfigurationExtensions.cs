using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace UdemyClone.Api.Data;

public static class DatabaseConfigurationExtensions
{
    public static DatabaseProvider GetDatabaseProvider(this IConfiguration configuration)
    {
        var rawValue = configuration["DbProvider"];
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            return DatabaseProvider.Sqlite;
        }

        return rawValue.Trim().ToLowerInvariant() switch
        {
            "sqlite" => DatabaseProvider.Sqlite,
            "sqlserver" => DatabaseProvider.SqlServer,
            "mssql" => DatabaseProvider.SqlServer,
            "postgres" => DatabaseProvider.Postgres,
            "postgresql" => DatabaseProvider.Postgres,
            _ => throw new InvalidOperationException(
                $"Unsupported DbProvider '{rawValue}'. Supported values: Sqlite, SqlServer, Postgres.")
        };
    }

    public static IServiceCollection AddApplicationDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var provider = configuration.GetDatabaseProvider();

        switch (provider)
        {
            case DatabaseProvider.Postgres:
                services.AddDbContext<ApplicationDbContext, PostgresApplicationDbContext>(options =>
                {
                    var connectionString = configuration.GetPostgresConnectionString();
                    options.UseNpgsql(
                        connectionString,
                        npgsql => npgsql.MigrationsAssembly(typeof(PostgresApplicationDbContext).Assembly.FullName));
                });
                break;

            case DatabaseProvider.SqlServer:
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    var connectionString = configuration.GetSqlServerConnectionString();
                    options.UseSqlServer(connectionString);
                });
                break;

            case DatabaseProvider.Sqlite:
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    var connectionString = configuration.GetSqliteConnectionString();
                    options.UseSqlite(connectionString);
                    options.ConfigureWarnings(warnings =>
                        warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
                });
                break;
        }

        return services;
    }

    public static string GetConfiguredConnectionString(this IConfiguration configuration)
    {
        return configuration.GetDatabaseProvider() switch
        {
            DatabaseProvider.Postgres => configuration.GetPostgresConnectionString(),
            DatabaseProvider.SqlServer => configuration.GetSqlServerConnectionString(),
            DatabaseProvider.Sqlite => configuration.GetSqliteConnectionString(),
            _ => throw new InvalidOperationException("Unsupported database provider.")
        };
    }

    private static string GetPostgresConnectionString(this IConfiguration configuration)
    {
        return configuration.GetConnectionString("Postgres")
            ?? configuration["DATABASE_URL"]
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Postgres connection string is missing.");
    }

    private static string GetSqlServerConnectionString(this IConfiguration configuration)
    {
        return configuration.GetConnectionString("SqlServer")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("SqlServer connection string is missing.");
    }

    private static string GetSqliteConnectionString(this IConfiguration configuration)
    {
        return configuration.GetConnectionString("Sqlite")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=udemyclone-api.db";
    }
}
