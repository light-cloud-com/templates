using Microsoft.Extensions.Options;
using Npgsql;

namespace CrudApi.Data;

public static class DatabaseServiceCollectionExtensions
{
    /// <summary>Registers <see cref="DatabaseOptions"/> and one pooled <see cref="NpgsqlDataSource"/>.</summary>
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton(Options.Create(DatabaseOptions.FromConfiguration(config)));
        services.AddSingleton(sp =>
            NpgsqlDataSource.Create(sp.GetRequiredService<IOptions<DatabaseOptions>>().Value.ToConnectionString()));
        return services;
    }
}
