using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace UdemyClone.Api.Tests.TestInfrastructure;

public sealed class ApiTestFactory : WebApplicationFactory<Program>
{
    private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"udemyclone-api-tests-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DbProvider"] = "Sqlite",
                ["ConnectionStrings:Sqlite"] = $"Data Source={_databasePath}",
                ["ConnectionStrings:DefaultConnection"] = $"Data Source={_databasePath}",
                ["Seed:AutoConfirmEmails"] = "true",
                ["Jwt:Key"] = "0123456789abcdef0123456789abcdef",
                ["Jwt:Issuer"] = "UdemyClone.Tests",
                ["Jwt:Audience"] = "UdemyClone.Tests"
            });
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            try
            {
                if (File.Exists(_databasePath))
                {
                    File.Delete(_databasePath);
                }
            }
            catch
            {
            }
        }
    }
}
