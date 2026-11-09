namespace DotnetApi.Services;

/// <summary>How long the app has been running.</summary>
public sealed class Uptime(TimeProvider clock)
{
    private readonly DateTimeOffset _startedAt = clock.GetUtcNow();

    public DateTimeOffset Now => clock.GetUtcNow();

    public TimeSpan Elapsed => clock.GetUtcNow() - _startedAt;
}
