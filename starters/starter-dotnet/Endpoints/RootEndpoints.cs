using DotnetApi.Services;
using Microsoft.Extensions.Options;

namespace DotnetApi.Endpoints;

public static class RootEndpoints
{
    /// <summary>GET / (API info) and GET /health (liveness with uptime).</summary>
    public static IEndpointRouteBuilder MapRootEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/", (IOptions<ApiInfoOptions> info) => new
        {
            message = info.Value.Message,
            version = info.Value.Version,
            endpoints = new
            {
                health = "/health",
                root = "/",
            },
        });

        app.MapGet("/health", (Uptime uptime) => new
        {
            status = "healthy",
            timestamp = uptime.Now.UtcDateTime.ToString("o"),
            uptime = uptime.Elapsed.TotalSeconds,
        });

        return app;
    }
}
