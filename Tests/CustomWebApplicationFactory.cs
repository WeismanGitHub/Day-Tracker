using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Server.Database;

namespace Tests
{
    public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram>
        where TProgram : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration(
                (context, config) =>
                {
                    config.AddJsonFile("appsettings.json");
                    config.AddEnvironmentVariables();
                }
            );

            builder.ConfigureServices(
                (context, services) =>
                {
                    var dbContextDescriptor = services.SingleOrDefault(d =>
                        d.ServiceType == typeof(DbContextOptions<DayTrackerContext>)
                    );

                    if (dbContextDescriptor != null)
                    {
                        services.Remove(dbContextDescriptor);
                    }

                    var dbConnectionDescriptor = services.SingleOrDefault(d =>
                        d.ServiceType == typeof(DbConnection)
                    );

                    if (dbConnectionDescriptor != null)
                    {
                        services.Remove(dbConnectionDescriptor);
                    }

                    var connectionString = context.Configuration.GetConnectionString(
                        "DefaultConnection"
                    );

                    services.AddDbContext<DayTrackerContext>(options =>
                        options.UseNpgsql(connectionString)
                    );
                }
            );

            builder.UseEnvironment("Development");
        }
    }
}
