using System.Text;
using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Server.Database.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
var config = builder.Configuration.GetSection("Config").Get<Configuration>();

if (config == null)
{
    throw new Exception("Invalid config.");
}

Console.WriteLine(config.Jwt.ValidIssuer);
AddServices();
var app = builder.Build();
SetMiddleware();

app.Run();

void AddServices()
{
    builder.Services.AddSingleton(config);
    builder.Services.AddScoped<UserService>();

    builder.Services.AddControllers();

    builder
        .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = config.Jwt.ValidIssuer,
                ValidAudience = config.Jwt.ValidAudience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(config.Jwt.Secret)
                )
            };
        });

    builder.Services.AddProblemDetails(options =>
    {
        options.IncludeExceptionDetails = (ctx, ex) => builder.Environment.IsDevelopment();

        options.Map<UsernameTakenException>(ex => new ProblemDetails()
        {
            Title = "Conflict",
            Detail = ex.Message,
            Status = StatusCodes.Status409Conflict,
        });

        options.Map<Exception>(ex => new ProblemDetails()
        {
            Title = "Internal Server Error",
            Detail = ex.Message,
            Status = StatusCodes.Status500InternalServerError,
        });
    });

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

    app.MapFallbackToFile("/index.html");
    app.UseAuthentication();
    app.UseStaticFiles();
    app.MapControllers();
}
