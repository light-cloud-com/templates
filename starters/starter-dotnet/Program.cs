using DotnetApi.Endpoints;
using DotnetApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Light Cloud passes the port in PORT; 8080 is for your own machine.
builder.WebHost.UseUrls($"http://0.0.0.0:{(builder.Configuration["PORT"] is { Length: > 0 } port ? port : "8080")}");

builder.Services.AddCors();
builder.Services.Configure<ApiInfoOptions>(builder.Configuration.GetSection(ApiInfoOptions.Section));
// Created now, not on the first request, so uptime counts from start.
builder.Services.AddSingleton(new Uptime(TimeProvider.System));

var app = builder.Build();

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.MapRootEndpoints();

app.Run();

// Lets the tests start the app with WebApplicationFactory<Program>.
public partial class Program;
