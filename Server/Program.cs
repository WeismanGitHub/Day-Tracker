using Microsoft.OpenApi.Models;
using Server.Api;
using Server;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
var config = builder.Configuration.Get<Configuration>()!;

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSingleton(config);
builder.Services.AddSwaggerGen(x =>
	x.SwaggerDoc(
		"v1",
		new OpenApiInfo() {
			Title = "Day Tracker Api",
			Description = "placeholder",
			Version = "1.0"
		}
	)
);

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseSecurityHeaders(SecurityHeadersPolicy.Create());
app.UseHsts();

app.MapFallbackToFile("/index.html");
app.UseStaticFiles();
app.MapControllers();

app.Run();
