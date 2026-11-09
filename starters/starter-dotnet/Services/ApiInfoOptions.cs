namespace DotnetApi.Services;

/// <summary>What GET / says about the API, from the "Api" section of appsettings.json.</summary>
public sealed class ApiInfoOptions
{
    public const string Section = "Api";

    public string Message { get; set; } = "Welcome to your .NET API";
    public string Version { get; set; } = "1.0.0";
}
