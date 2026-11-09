using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace DotnetApi.Tests;

/// <summary>Runs the real app in memory; nothing listens on a port.</summary>
public class RootEndpointsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task RootDescribesTheApi()
    {
        var json = await GetJson("/");
        Assert.Equal("Welcome to your .NET API", json.GetProperty("message").GetString());
        Assert.Equal("1.0.0", json.GetProperty("version").GetString());
        Assert.Equal("/health", json.GetProperty("endpoints").GetProperty("health").GetString());
    }

    [Fact]
    public async Task HealthIsHealthyWithUptime()
    {
        var json = await GetJson("/health");
        Assert.Equal("healthy", json.GetProperty("status").GetString());
        Assert.True(json.GetProperty("uptime").GetDouble() >= 0);
        Assert.EndsWith("Z", json.GetProperty("timestamp").GetString());
    }

    [Fact]
    public async Task UnknownRouteIs404()
    {
        var response = await _client.GetAsync("/nope");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<JsonElement> GetJson(string path)
    {
        var response = await _client.GetAsync(path);
        response.EnsureSuccessStatusCode();
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;
    }
}
