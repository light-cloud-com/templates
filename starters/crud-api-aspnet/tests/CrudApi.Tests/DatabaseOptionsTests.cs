using CrudApi.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace CrudApi.Tests;

public class DatabaseOptionsTests
{
    private static NpgsqlConnectionStringBuilder Build(Dictionary<string, string?> settings) =>
        new(DatabaseOptions.FromConfiguration(new ConfigurationBuilder().AddInMemoryCollection(settings).Build())
            .ToConnectionString());

    [Fact]
    public void RequiresTlsByDefault()
    {
        var cs = Build(new() { ["DB_HOST"] = "db.internal", ["DB_PASSWORD"] = "" });
        Assert.Equal(SslMode.Require, cs.SslMode);
        Assert.Equal("db.internal", cs.Host);
        Assert.Equal("postgres", cs.Database);
    }

    [Fact]
    public void KeepsHostAndPortAndHonoursDisable()
    {
        var cs = Build(new() { ["DB_HOST"] = "localhost:5433", ["DB_NAME"] = "items", ["DB_SSLMODE"] = "disable" });
        Assert.Equal("localhost:5433", cs.Host);
        Assert.Equal("items", cs.Database);
        Assert.Equal(SslMode.Disable, cs.SslMode);
    }
}
