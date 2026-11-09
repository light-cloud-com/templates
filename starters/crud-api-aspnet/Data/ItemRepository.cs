using CrudApi.Models;
using Npgsql;

namespace CrudApi.Data;

/// <summary>SQL for the items table.</summary>
public sealed class ItemRepository(NpgsqlDataSource db)
{
    private const string Columns = "id, name, description, created_at, updated_at";

    public async Task EnsureTableAsync()
    {
        await using var cmd = db.CreateCommand("""
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """);
        await cmd.ExecuteNonQueryAsync();
    }

    public Task<List<Item>> ListAsync(PageRequest page) =>
        QueryAsync($"SELECT {Columns} FROM items ORDER BY id LIMIT $1 OFFSET $2", page.Limit, page.Offset);

    public async Task<Item?> GetAsync(int id) =>
        (await QueryAsync($"SELECT {Columns} FROM items WHERE id = $1", id)).SingleOrDefault();

    public async Task<Item> CreateAsync(ItemInput input) =>
        (await QueryAsync($"INSERT INTO items (name, description) VALUES ($1, $2) RETURNING {Columns}",
            input.Name, input.Description))[0];

    public async Task<Item?> UpdateAsync(int id, ItemInput input) =>
        (await QueryAsync(
            $"UPDATE items SET name = $1, description = $2, updated_at = now() WHERE id = $3 RETURNING {Columns}",
            input.Name, input.Description, id)).SingleOrDefault();

    public async Task<bool> DeleteAsync(int id)
    {
        await using var cmd = db.CreateCommand("DELETE FROM items WHERE id = $1");
        cmd.Parameters.Add(new NpgsqlParameter { Value = id });
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    private async Task<List<Item>> QueryAsync(string sql, params object?[] args)
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
}
