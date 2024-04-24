using Microsoft.AspNetCore.Mvc;

namespace Server;

public class FetchMetadataMiddleware
{
    private readonly RequestDelegate _next;
    private readonly List<string> AllowedFetchSites = ["same-origin", "same-site", "none"];

    public FetchMetadataMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (AllowedFetchSites.Contains(context.Request.Headers["Sec-Fetch-Site"]))
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
        await _next(context);
    }
}

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
