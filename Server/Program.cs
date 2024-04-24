using System.Text;
using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Server.Database.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
var config = builder.Configuration.Get<Configuration>()!;

AddServices();
var app = builder.Build();
SetMiddleware();

app.Run();

void AddServices()
{
    builder.Services.AddSingleton(config);
    builder.Services.AddScoped<UserService>();

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
            //     fetchMetadata({
            //allowedFetchSites: ['same-origin', 'same-site', 'none'],
            //       disallowedNavigationRequests: ['frame', 'iframe'],
            //       errorStatusCode: 403,
            //       allowedPaths: [],
            //       onError: (_req, res, _next, options) => {
            //		res.statusCode = options.errorStatusCode;
            //		res.end();
            //	},
            //   })

            List<string> allowedFetchSites = ["same-origin", "same-site", "none"];

            if (allowedFetchSites.Contains(context.Request.Headers["Sec-Fetch-Site"]))
            {
                context.Response.StatusCode = 403;

                await context.Response.WriteAsJsonAsync(
                    new ProblemDetails()
                    {
                        Title = "Forbidden",
                        Status = 403,
                        Detail = "Invalid fetch metadata header(s)"
                    }
                );
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
                builder.AddImgSrc().Self();
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
