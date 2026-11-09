namespace CrudApi.Models;

/// <summary>An item as stored and returned (snake_case on the wire).</summary>
public record Item(int Id, string Name, string? Description, DateTime CreatedAt, DateTime UpdatedAt);
