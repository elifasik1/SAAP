using Microsoft.EntityFrameworkCore;
using SAAP.Infrastructure.Persistence;
using StackExchange.Redis;
using SAAP.Infrastructure.Caching;
using SAAP.API.Middleware;
using Serilog;

// Serilog yapılandırması
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Serilog'u host'a ekle
builder.Host.UseSerilog();

// Servislerin tanımlanması
var redisConnectionString = builder.Configuration.GetSection("RedisSettings:ConnectionString").Value ?? "localhost:6379";
var redis = ConnectionMultiplexer.Connect(redisConnectionString);
builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
builder.Services.AddScoped<RedisRateLimiterService>();

builder.Services.AddDbContext<SaapDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddOpenApi();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<SaapDbContext>();
    dbContext.Database.EnsureCreated(); 
}

// HTTP İstek Hattı (Pipeline)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Middleware (Güvenlik Bekçisi) en başta olmalı
app.UseMiddleware<AuditLoggingMiddleware>();

// Endpointler
app.MapGet("/api/audit-logs", async (SaapDbContext db) =>
{
    var logs = await db.AuditLogs
        .OrderByDescending(x => x.CreatedAt)
        .Take(50)
        .ToListAsync();
    return Results.Ok(logs);
});

app.MapGet("/weatherforecast", () =>
{
    var summaries = new[] { "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching" };
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
