using Server.Database.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
var config = builder.Configuration.Get<Configuration>()!;

builder.Services.AddSingleton(config);
builder.Services.AddScoped<UserService>();

Services.Add(builder, config);

var app = builder.Build();

Services.Use(app);

app.Run();
