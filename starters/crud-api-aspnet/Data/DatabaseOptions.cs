using Npgsql;

namespace CrudApi.Data;

/// <summary>
/// The database connection, read from the DB_* settings Light Cloud sets
/// (environment variables, or appsettings.json for your own machine).
/// </summary>
public sealed class DatabaseOptions
{
    /// <summary>"host" or "host:port".</summary>
    public string Host { get; set; } = "localhost";
    public string Name { get; set; } = "postgres";
    public string User { get; set; } = "postgres";
    public string Password { get; set; } = "";
    /// <summary>
    /// require: TLS on, certificate not verified (the database's certificate is platform-internal).
    /// disable: no TLS, for a local database.
    /// </summary>
    public string SslMode { get; set; } = "require";

    public static DatabaseOptions FromConfiguration(IConfiguration config)
    {
        // Empty values count as unset, like a variable that was cleared in the console.
        string Read(string key, string fallback) => config[key] is { Length: > 0 } v ? v : fallback;
        var defaults = new DatabaseOptions();
        return new DatabaseOptions
        {
            Host = Read("DB_HOST", defaults.Host),
            Name = Read("DB_NAME", defaults.Name),
            User = Read("DB_USER", defaults.User),
            Password = Read("DB_PASSWORD", defaults.Password),
            SslMode = Read("DB_SSLMODE", defaults.SslMode),
        };
    }

    public string ToConnectionString() => new NpgsqlConnectionStringBuilder
    {
        Host = Host,
        Database = Name,
        Username = User,
        Password = Password,
        SslMode = Enum.Parse<Npgsql.SslMode>(SslMode, ignoreCase: true),
        MaxPoolSize = 5,
    }.ConnectionString;
}
