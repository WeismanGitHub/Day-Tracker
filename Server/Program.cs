var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

AppUtilities.AddServices(builder.Services, builder.Configuration);
var app = builder.Build();
AppUtilities.ConfigureMiddleware(app);

app.Run();

public partial class Program { }
