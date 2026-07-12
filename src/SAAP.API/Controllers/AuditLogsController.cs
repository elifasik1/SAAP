using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAAP.Infrastructure.Persistence;

namespace SAAP.API.Controllers;

[ApiController]
[Route("api/audit-logs")]
[EnableCors("AllowFrontend")]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly SaapDbContext _dbContext;

    public AuditLogsController(SaapDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyLogs()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { Message = "Geçersiz oturum." });

        var logs = await _dbContext.AuditLogs
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(100)
            .Select(x => new AuditLogResponse(
                x.Id,
                x.IpAddress,
                x.Path,
                x.HttpMethod,
                x.StatusCode,
                x.DurationMs,
                x.UserEmail ?? "anonim",
                x.CreatedAt
            ))
            .ToListAsync();

        return Ok(logs);
    }
}

public record AuditLogResponse(
    Guid Id,
    string Ip,
    string Endpoint,
    string Method,
    int Status,
    long Duration,
    string User,
    DateTime CreatedAt
);
