using Npgsql;

namespace CrudApi.Endpoints;

public static class RootEndpoints
{
    private static readonly string[] Routes =
    [
        "GET /health",
        "GET /items?limit=20&offset=0",
        "GET /items/{id}",
        "POST /items",
        "PUT /items/{id}",
        "DELETE /items/{id}",
        "GET /openapi/v1.json",
    ];

    /// <summary>GET / (route index) and GET /health (database check).</summary>
    public static IEndpointRouteBuilder MapRootEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/", () => new { name = "CRUD API (ASP.NET Core)", routes = Routes });

        app.MapGet("/health", async (NpgsqlDataSource db) =>
        {
            try
            {
                await using var cmd = db.CreateCommand("SELECT 1");
                await cmd.ExecuteScalarAsync();
                return Results.Ok(new { status = "ok" });
            }
            catch (Exception)
            {
                return Results.Json(new { error = "Database unavailable" }, statusCode: 503);
            }
        });

        return app;
    }
}
