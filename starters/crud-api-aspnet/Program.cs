using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Npgsql;

const string Columns = "id, name, description, created_at, updated_at";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower);
// Light Cloud passes the port in PORT; 8080 is for your own machine.
builder.WebHost.UseUrls($"http://+:{Environment.GetEnvironmentVariable("PORT") ?? "8080"}");

// Light Cloud sets DB_HOST ("host" or "host:port"), DB_NAME, DB_USER and DB_PASSWORD.
// SSL Mode=Require: TLS on, certificate not verified (the database's certificate is
// platform-internal). Set DB_SSLMODE=disable for a local database without TLS.
string Env(string key, string fallback) => Environment.GetEnvironmentVariable(key) is { Length: > 0 } v ? v : fallback;
var connection = new NpgsqlConnectionStringBuilder
{
    Host = Env("DB_HOST", "localhost"),
    Database = Env("DB_NAME", "postgres"),
    Username = Env("DB_USER", "postgres"),
    Password = Env("DB_PASSWORD", ""),
    SslMode = Enum.Parse<SslMode>(Env("DB_SSLMODE", "require"), ignoreCase: true),
    MaxPoolSize = 5,
};
await using var db = NpgsqlDataSource.Create(connection.ConnectionString);

// Creates the table on start. If the database is unreachable the app does not start.
await using (var create = db.CreateCommand("""
    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    """))
{
    try
    {
        await create.ExecuteNonQueryAsync();
    }
    catch (Exception e)
    {
        Console.Error.WriteLine($"Could not reach the database: {e.Message}");
        Environment.Exit(1);
    }
}

var app = builder.Build();

// Every error leaves as {"error": "..."}: unexpected exceptions, then empty error responses
// such as unknown routes, ids that are not numbers and unreadable JSON.
app.UseExceptionHandler(e => e.Run(ctx =>
    ctx.Response.WriteAsJsonAsync(new { error = "Something went wrong" })));
app.UseStatusCodePages(ctx =>
    ctx.HttpContext.Response.WriteAsJsonAsync(new { error = ReasonPhrases.GetReasonPhrase(ctx.HttpContext.Response.StatusCode) }));
app.MapOpenApi();
// No UseHttpsRedirection: HTTPS ends at the Light Cloud edge.

async Task<List<Item>> Query(string sql, params object?[] args)
{
    await using var cmd = db.CreateCommand(sql);
    foreach (var arg in args) cmd.Parameters.Add(new NpgsqlParameter { Value = arg ?? DBNull.Value });
    await using var reader = await cmd.ExecuteReaderAsync();
    var items = new List<Item>();
    while (await reader.ReadAsync())
    {
        items.Add(new Item(
            reader.GetInt32(0),
            reader.GetString(1),
            reader.IsDBNull(2) ? null : reader.GetString(2),
            reader.GetDateTime(3),
            reader.GetDateTime(4)));
    }
    return items;
}

var notFound = Results.NotFound(new { error = "Item not found" });
IResult BadRequest(string message) => Results.BadRequest(new { error = message });

app.MapGet("/", () => new
{
    name = "CRUD API (ASP.NET Core)",
    routes = new[]
    {
        "GET /health",
        "GET /items?limit=20&offset=0",
        "GET /items/{id}",
        "POST /items",
        "PUT /items/{id}",
        "DELETE /items/{id}",
        "GET /openapi/v1.json",
    },
});

app.MapGet("/health", async () =>
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

app.MapGet("/items", async (string? limit, string? offset) =>
{
    var take = 20L;
    var skip = 0L;
    if ((limit is not null && (!long.TryParse(limit, out take) || take is < 1 or > 100)) ||
        (offset is not null && (!long.TryParse(offset, out skip) || skip < 0)))
    {
        return BadRequest("limit must be 1 to 100 and offset 0 or more");
    }
    return Results.Ok(await Query($"SELECT {Columns} FROM items ORDER BY id LIMIT $1 OFFSET $2", take, skip));
});

app.MapGet("/items/{id:int}", async (int id) =>
    (await Query($"SELECT {Columns} FROM items WHERE id = $1", id)) is [var item] ? Results.Ok(item) : notFound);

app.MapPost("/items", async (JsonElement body) =>
{
    var (name, description, error) = ItemInput.Parse(body);
    if (error is not null) return BadRequest(error);
    var item = (await Query($"INSERT INTO items (name, description) VALUES ($1, $2) RETURNING {Columns}", name, description))[0];
    return Results.Created($"/items/{item.Id}", item);
});

app.MapPut("/items/{id:int}", async (int id, JsonElement body) =>
{
    var (name, description, error) = ItemInput.Parse(body);
    if (error is not null) return BadRequest(error);
    var rows = await Query(
        $"UPDATE items SET name = $1, description = $2, updated_at = now() WHERE id = $3 RETURNING {Columns}",
        name, description, id);
    return rows is [var item] ? Results.Ok(item) : notFound;
});

app.MapDelete("/items/{id:int}", async (int id) =>
{
    await using var cmd = db.CreateCommand("DELETE FROM items WHERE id = $1");
    cmd.Parameters.Add(new NpgsqlParameter { Value = id });
    return await cmd.ExecuteNonQueryAsync() > 0 ? Results.NoContent() : notFound;
});

app.Run();

record Item(int Id, string Name, string? Description, DateTime CreatedAt, DateTime UpdatedAt);

static class ItemInput
{
    // Reads {"name", "description"} from the body, or returns an error message.
    public static (string Name, string? Description, string? Error) Parse(JsonElement body)
    {
        if (body.ValueKind != JsonValueKind.Object) return ("", null, "Send a JSON object");
        var name = body.TryGetProperty("name", out var n) && n.ValueKind == JsonValueKind.String ? n.GetString()!.Trim() : "";
        if (name.Length is < 1 or > 200) return ("", null, "name is required and must be 1 to 200 characters");
        if (!body.TryGetProperty("description", out var d) || d.ValueKind == JsonValueKind.Null) return (name, null, null);
        if (d.ValueKind != JsonValueKind.String) return ("", null, "description must be a string");
        return (name, d.GetString(), null);
    }
}
