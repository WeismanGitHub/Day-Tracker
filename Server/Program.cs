var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
var config = builder.Configuration.GetSection("Config").Get<Configuration>();

if (config == null)
{
    throw new Exception("Invalid config.");
}

AppUtilities.AddServices(builder.Services, config);
var app = builder.Build();
AppUtilities.ConfigureMiddleware(app);

app.Run();
