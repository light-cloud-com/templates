var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();

var app = builder.Build();

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

var startTime = DateTime.UtcNow;

app.MapGet("/", () => new
{
    message = "Welcome to your .NET API",
    version = "1.0.0",
    endpoints = new
    {
        health = "/health",
        root = "/"
    }
});

app.MapGet("/health", () => new
{
    status = "healthy",
    timestamp = DateTime.UtcNow.ToString("o"),
    uptime = (DateTime.UtcNow - startTime).TotalSeconds
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");
