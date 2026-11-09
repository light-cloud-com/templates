using System.Text.Json;

namespace CrudApi.Models;

/// <summary>The validated body of POST and PUT /items.</summary>
public sealed record ItemInput(string Name, string? Description)
{
    /// <summary>Reads {"name", "description"} from the body, or returns an error message.</summary>
    // Read from raw JSON so a number sent as "name" is rejected, not converted.
    public static (ItemInput? Input, string? Error) Parse(JsonElement body)
    {
        if (body.ValueKind != JsonValueKind.Object) return (null, "Send a JSON object");
        var name = body.TryGetProperty("name", out var n) && n.ValueKind == JsonValueKind.String ? n.GetString()!.Trim() : "";
        if (name.Length is < 1 or > 200) return (null, "name is required and must be 1 to 200 characters");
        if (!body.TryGetProperty("description", out var d) || d.ValueKind == JsonValueKind.Null) return (new ItemInput(name, null), null);
        if (d.ValueKind != JsonValueKind.String) return (null, "description must be a string");
        return (new ItemInput(name, d.GetString()), null);
    }
}
