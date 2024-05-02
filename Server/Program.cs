using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Server.Database.Services;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
var config = builder.Configuration.GetSection("Config").Get<Configuration>();

if (config == null)
{
    throw new Exception("Invalid config.");
}

AddServices();
var app = builder.Build();
SetMiddleware();

app.Run();

void AddServices()
{
    var services = builder.Services;

    services.AddSingleton(config);
    services.AddScoped<UserService>();

    services.AddControllers();
    services.AddAuthorization();
    builder
        .Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
        .AddCookie(options =>
        {
            options.ExpireTimeSpan = TimeSpan.FromDays(30);
            options.SlidingExpiration = true;
        });

    services.AddProblemDetails(options =>
    {
        options.IncludeExceptionDetails = (ctx, ex) => builder.Environment.IsDevelopment();

        options.Map<UsernameTakenException>(ex => new ProblemDetails()
        {
            Title = "Conflict",
            Detail = ex.Message,
            Status = StatusCodes.Status409Conflict,
        });

        options.Map<ValidationException>(ex => new ProblemDetails()
        {
            Title = "Validation Error",
            Detail = ex.Message,
            Status = StatusCodes.Status400BadRequest,
        });

        options.Map<BadRequestException>(ex => new ProblemDetails()
        {
            Title = "Bad Request",
            Detail = ex.Message,
            Status = StatusCodes.Status400BadRequest,
        });

        options.Map<UnauthorizedException>(ex => new ProblemDetails()
        {
            Title = "Unauthorized",
            Detail = ex.Message,
            Status = StatusCodes.Status401Unauthorized,
        });

        options.Map<Exception>(ex => new ProblemDetails()
        {
            Title = "Internal Server Error",
            Detail = ex.Message,
            Status = StatusCodes.Status500InternalServerError,
        });
    });

    services.AddEndpointsApiExplorer();
    services.Configure<SwaggerUIOptions>(options => options.EnableTryItOutByDefault());
    services.AddSwaggerGen(x =>
    {
        x.SwaggerDoc(
            "v1",
            new OpenApiInfo()
            {
                Title = "Day Tracker Api",
                Description = "placeholder",
                Version = "1.0"
            }
        );
    });
}

void SetMiddleware()
{
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseProblemDetails();

    app.UseHttpsRedirection();
    app.UseHsts();
    app.Use(
        async (context, next) =>
        {
            List<string> fetchSites = ["same-origin", "same-site", "none"];
            List<string> disallowedDestinations = ["object", "embed"];
            List<string> modes = ["navigate", "same-origin", "cors", "no-cors"];

            var headers = context.Request.Headers;

            if (
                !fetchSites.Contains(headers["Sec-Fetch-Site"])
                || disallowedDestinations.Contains(headers["Sec-Fetch-Dest"])
                || !modes.Contains(headers["Sec-Fetch-Mode"])
            )
            {
                context.Response.StatusCode = 403;

                await context.Response.WriteAsJsonAsync(
                    new ProblemDetails()
                    {
                        Title = "Forbidden",
                        Status = 403,
                        Detail = "Invalid fetch metadata"
                    }
                );

                return;
            }

            await next(context);
        }
    );
    app.UseSecurityHeaders(
        new HeaderPolicyCollection()
            .AddFrameOptionsDeny()
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
                builder.AddFrameAncestors().None();
                builder.AddCustomDirective("require-trusted-types-for", "'script'");
            })
            .AddStrictTransportSecurityMaxAgeIncludeSubDomains(maxAgeInSeconds: 60 * 60 * 24 * 365)
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
    app.UseAuthorization();
    app.MapFallbackToFile("/index.html");
    app.UseStaticFiles();
    app.MapControllers();
}
