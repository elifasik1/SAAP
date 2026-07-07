using System.Diagnostics;
using SAAP.Infrastructure.Persistence; // SaapDbContext için
using SAAP.Domain.Entities;            // AuditLog için
using SAAP.Infrastructure.Caching; // RedisRateLimiterService bu klasörde

namespace SAAP.API.Middleware;

public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditLoggingMiddleware> _logger;

    public AuditLoggingMiddleware(RequestDelegate next, ILogger<AuditLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, SaapDbContext dbContext,RedisRateLimiterService rateLimiter)
{
    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    // 1. Redis'ten kontrol et
    if (!await rateLimiter.IsAllowedAsync(ip))
    {
        context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.Response.WriteAsync("Çok fazla istek attın, biraz bekle!");
        return; // İşlemi burada kesiyoruz
    }

    // 2. Limit aşılmadıysa, isteği devam ettir (önceki loglama mantığınla birleştir)
    await _next(context);
    var sw = Stopwatch.StartNew();
    
    // İstek devam etsin
    await _next(context);

    sw.Stop();

    try
    {
        var log = new AuditLog
        {
            IpAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            Path = context.Request.Path,
            StatusCode = context.Response.StatusCode,
            DurationMs = sw.ElapsedMilliseconds
        };

        dbContext.AuditLogs.Add(log);
        await dbContext.SaveChangesAsync();
    }
    catch (Exception ex)
    {
        // Eğer veritabanı bağlantısı koparsa veya hata olursa,
        // uygulamanın ana akışını bozmamak için hatayı yutuyoruz ve logluyoruz.
        _logger.LogError(ex, "Audit log yazılırken hata oluştu");
    }
}
}
