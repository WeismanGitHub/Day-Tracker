var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

AppUtilities.AddServices(builder.Services);
var app = builder.Build();
AppUtilities.ConfigureMiddleware(app);

app.Run();
