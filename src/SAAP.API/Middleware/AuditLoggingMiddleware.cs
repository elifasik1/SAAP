using System.Diagnostics;
using System.Security.Claims;
using SAAP.Infrastructure.Persistence;
using SAAP.Domain.Entities;
using SAAP.Infrastructure.Caching;

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

    public async Task InvokeAsync(HttpContext context, SaapDbContext dbContext, RedisRateLimiterService rateLimiter)
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        if (!await rateLimiter.IsAllowedAsync(ip))
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await context.Response.WriteAsync("Çok fazla istek attın, biraz bekle!");
            return;
        }

        var sw = Stopwatch.StartNew();
        await _next(context);
        sw.Stop();

        try
        {
            var userIdClaim = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? userId = Guid.TryParse(userIdClaim, out var parsedId) ? parsedId : null;
            var userEmail = context.User.FindFirstValue(ClaimTypes.Email);

            var log = new AuditLog
            {
                IpAddress = ip,
                Path = context.Request.Path,
                HttpMethod = context.Request.Method,
                StatusCode = context.Response.StatusCode,
                DurationMs = sw.ElapsedMilliseconds,
                UserId = userId,
                UserEmail = userEmail
            };

            dbContext.AuditLogs.Add(log);

            if (userId is not null && context.Response.StatusCode >= 400)
            {
                var settings = await dbContext.UserSecuritySettings.FindAsync(userId.Value);
                if (settings?.AuditNotificationsEnabled ?? true)
                {
                    dbContext.Notifications.Add(new Notification
                    {
                        UserId = userId.Value,
                        Type = "error",
                        Message = $"{context.Response.StatusCode} hatası: {context.Request.Method} {context.Request.Path}"
                    });
                }
            }
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Audit log yazılırken hata oluştu");
        }
    }
}
