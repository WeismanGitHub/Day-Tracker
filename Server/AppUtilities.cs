﻿using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Server.Database.Services;

namespace Server;

public static class AppUtilities
{
    public static void AddServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped((p) => new ChartService(configuration));
        services.AddScoped((p) => new EntryService(configuration));
        services.AddScoped((p) => new UserService(configuration));

        services.AddControllers();
        services.AddAuthorization();
        services
            .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.ExpireTimeSpan = TimeSpan.FromDays(30);
                options.SlidingExpiration = true;
            });

        services.AddProblemDetails(options =>
        {
            options.IncludeExceptionDetails = (ctx, ex) => false;

            options.Map<CustomException>(ex => new ProblemDetails()
            {
                Title = ex.Title,
                Detail = ex.Message,
                Status = ex.Status,
            });

            options.Map<Exception>(ex => new ProblemDetails()
            {
                Title = "Internal Server Error",
                Detail = ex.Message,
                Status = StatusCodes.Status500InternalServerError,
            });
        });

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(x =>
        {
            x.SwaggerDoc(
                "v1",
                new OpenApiInfo()
                {
                    Title = "Day Tracker Api",
                    Description =
                        "Input data into personalized calendar heatmaps to visualize patterns over time.",
                    Version = "1.0"
                }
            );
        });
    }

    public static void ConfigureMiddleware(WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options => options.EnableTryItOutByDefault());

        app.UseProblemDetails();

        app.UseHttpsRedirection();
        app.UseHsts();
        app.UseSecurityHeaders(
            new HeaderPolicyCollection()
                .AddContentTypeOptionsNoSniff()
                .AddReferrerPolicyStrictOriginWhenCrossOrigin()
                .AddCrossOriginOpenerPolicy(builder => builder.SameOrigin())
                .AddCrossOriginEmbedderPolicy(builder => builder.RequireCorp())
                .AddCrossOriginResourcePolicy(builder => builder.SameOrigin())
                .RemoveServerHeader()
                .AddContentSecurityPolicy(builder =>
                {
                    builder.AddDefaultSrc().Self();
                    builder.AddObjectSrc().None();
                    builder.AddBlockAllMixedContent();
                    builder.AddImgSrc().Self().From("data:");
                    builder.AddFormAction().None();
                    builder.AddFontSrc().Self();
                    builder.AddStyleSrc().Self();
                    builder.AddScriptSrc().Self();
                    builder.AddBaseUri().Self();
                    builder.AddCustomDirective("require-trusted-types-for", "'script'");
                })
                .AddStrictTransportSecurityMaxAgeIncludeSubDomains(
                    maxAgeInSeconds: 60 * 60 * 24 * 365
                )
                .AddPermissionsPolicy(builder =>
                {
                    builder.AddAccelerometer().None();
                    builder.AddAutoplay().None();
                    builder.AddCamera().None();
                    builder.AddEncryptedMedia().None();
                    builder.AddFullscreen().All();
                    builder.AddGeolocation().None();
                    builder.AddGyroscope().None();
                    builder.AddMagnetometer().None();
                    builder.AddMicrophone().None();
                    builder.AddMidi().None();
                    builder.AddPayment().None();
                    builder.AddPictureInPicture().None();
                    builder.AddSyncXHR().None();
                    builder.AddUsb().None();
                })
        );

        var cookiePolicy = new CookiePolicyOptions()
        {
            HttpOnly = HttpOnlyPolicy.Always,
            MinimumSameSitePolicy = SameSiteMode.Strict,
            Secure = CookieSecurePolicy.Always,
        };

        app.UseCookiePolicy(cookiePolicy);
        app.UseAuthentication();
        app.Use(
            async (context, next) =>
            {
                var metadata = context.GetEndpoint()?.Metadata;
                var requiresAuthorization = metadata?.GetMetadata<IAllowAnonymous>() == null;

                if (
                    context.User?.Identity?.IsAuthenticated != true
                    && context.Request.Path.StartsWithSegments("/api")
                    && requiresAuthorization
                )
                {
                    throw new UnauthorizedException();
                }

                await next();
            }
        );
        app.Use(
            async (context, next) =>
            {
                if (context.Request.Path == "/example")
                {
                    context.Response.Headers.Remove("X-Frame-Options");
                }
                else
                {
                    context.Response.Headers.XFrameOptions = "DENY";
                }

                await next();
            }
        );
        app.UseAuthorization();
        app.MapControllers();
        app.MapFallbackToFile("/index.html");
        app.UseStaticFiles();
    }
}
