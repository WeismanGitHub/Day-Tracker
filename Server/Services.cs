using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;

namespace Server;

public static class Services
{
    public static void Add(WebApplicationBuilder builder)
    {
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddSwaggerGen(x =>
            x.SwaggerDoc(
                "v1",
                new OpenApiInfo()
                {
                    Title = "Day Tracker Api",
                    Description = "placeholder",
                    Version = "1.0"
                }
            )
        );

        builder
            .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(
                JwtBearerDefaults.AuthenticationScheme,
                options => builder.Configuration.Bind("JwtSettings", options)
            )
            .AddCookie(
                CookieAuthenticationDefaults.AuthenticationScheme,
                options => builder.Configuration.Bind("CookieSettings", options)
            );
    }

    public static void Use(WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseSecurityHeaders(SecurityHeadersPolicy.Create());
        app.UseHsts();

        app.MapFallbackToFile("/index.html");
        app.UseStaticFiles();
        app.MapControllers();
    }
}
