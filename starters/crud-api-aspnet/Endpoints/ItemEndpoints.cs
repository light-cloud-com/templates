using System.Text.Json;
using CrudApi.Data;
using CrudApi.Models;

namespace CrudApi.Endpoints;

public static class ItemEndpoints
{
    private static readonly IResult NotFound = Results.NotFound(new { error = "Item not found" });

    private static IResult BadRequest(string message) => Results.BadRequest(new { error = message });

    /// <summary>CRUD for /items. Ids that are not whole numbers do not match a route, so they are 404.</summary>
    public static IEndpointRouteBuilder MapItemEndpoints(this IEndpointRouteBuilder app)
    {
        var items = app.MapGroup("/items");

        items.MapGet("", async (string? limit, string? offset, ItemRepository repo) =>
            PageRequest.TryParse(limit, offset, out var page)
                ? Results.Ok(await repo.ListAsync(page))
                : BadRequest(PageRequest.Rule));

        items.MapGet("/{id:int}", async (int id, ItemRepository repo) =>
            await repo.GetAsync(id) is { } item ? Results.Ok(item) : NotFound);

        items.MapPost("", async (JsonElement body, ItemRepository repo) =>
        {
            var (input, error) = ItemInput.Parse(body);
            if (input is null) return BadRequest(error!);
            var item = await repo.CreateAsync(input);
            return Results.Created($"/items/{item.Id}", item);
        });

        items.MapPut("/{id:int}", async (int id, JsonElement body, ItemRepository repo) =>
        {
            var (input, error) = ItemInput.Parse(body);
            if (input is null) return BadRequest(error!);
            return await repo.UpdateAsync(id, input) is { } item ? Results.Ok(item) : NotFound;
        });

        items.MapDelete("/{id:int}", async (int id, ItemRepository repo) =>
            await repo.DeleteAsync(id) ? Results.NoContent() : NotFound);

        return app;
    }
}
