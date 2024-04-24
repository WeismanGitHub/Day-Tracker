using System.Text;
using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace Server;

public static class Services
{
    public static void Add(WebApplicationBuilder builder, Configuration config)
    {
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
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = config.JWT.ValidIssuer,
                    ValidAudience = config.JWT.ValidAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(config.JWT.Secret)
                    )
                };
            });
    }

    public static void Use(WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseMiddleware<FetchMetadataMiddleware>();
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseSecurityHeaders(SecurityHeadersPolicy.Create());
        app.UseHsts();

        app.MapFallbackToFile("/index.html");
        app.UseStaticFiles();
        app.MapControllers();
    }
}
