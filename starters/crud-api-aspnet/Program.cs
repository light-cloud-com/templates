using System.Text.Json;
using CrudApi.Data;
using CrudApi.Endpoints;
using Microsoft.AspNetCore.WebUtilities;

var builder = WebApplication.CreateBuilder(args);

// Light Cloud passes the port in PORT; 8080 is for your own machine.
builder.WebHost.UseUrls($"http://+:{(builder.Configuration["PORT"] is { Length: > 0 } port ? port : "8080")}");
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower);
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddSingleton<ItemRepository>();

var app = builder.Build();

// Creates the table on start. If the database is unreachable the app does not start.
try
{
    await app.Services.GetRequiredService<ItemRepository>().EnsureTableAsync();
}
catch (Exception e)
{
    Console.Error.WriteLine($"Could not reach the database: {e.Message}");
    Environment.Exit(1);
}

// Every error leaves as {"error": "..."}: unexpected exceptions, then empty error responses
// such as unknown routes, ids that are not numbers and unreadable JSON.
app.UseExceptionHandler(e => e.Run(ctx =>
    ctx.Response.WriteAsJsonAsync(new { error = "Something went wrong" })));
app.UseStatusCodePages(ctx =>
    ctx.HttpContext.Response.WriteAsJsonAsync(new { error = ReasonPhrases.GetReasonPhrase(ctx.HttpContext.Response.StatusCode) }));
// No UseHttpsRedirection: HTTPS ends at the Light Cloud edge.

app.MapOpenApi();
app.MapRootEndpoints();
app.MapItemEndpoints();

app.Run();
