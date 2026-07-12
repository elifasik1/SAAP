using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAAP.Domain.Entities;
using SAAP.Infrastructure.Persistence;

namespace SAAP.API.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController(SaapDbContext dbContext) : ControllerBase
{
    [HttpGet("security")]
    public async Task<ActionResult<SecuritySettingsResponse>> GetSecuritySettings()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var settings = await dbContext.UserSecuritySettings.FindAsync(userId.Value);
        return Ok(ToResponse(settings ?? CreateDefaults(userId.Value)));
    }

    [HttpPut("security")]
    public async Task<ActionResult<SecuritySettingsResponse>> UpdateSecuritySettings(SecuritySettingsRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var settings = await dbContext.UserSecuritySettings.FindAsync(userId.Value);
        if (settings is null)
        {
            settings = CreateDefaults(userId.Value);
            dbContext.UserSecuritySettings.Add(settings);
        }

        settings.TwoFactorEnabled = request.TwoFactorEnabled;
        settings.SessionLockEnabled = request.SessionLockEnabled;
        settings.IpWhitelistEnabled = request.IpWhitelistEnabled;
        settings.AuditNotificationsEnabled = request.AuditNotificationsEnabled;
        settings.ApiKeyRotationEnabled = request.ApiKeyRotationEnabled;
        settings.UpdatedAt = DateTime.UtcNow;

        dbContext.Notifications.Add(new Notification
        {
            UserId = userId.Value,
            Type = "system",
            Message = "Güvenlik ayarlarınız güncellendi."
        });
        await dbContext.SaveChangesAsync();
        return Ok(ToResponse(settings));
    }

    private Guid? GetUserId() => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    private static UserSecuritySettings CreateDefaults(Guid userId) => new()
    {
        UserId = userId,
        TwoFactorEnabled = false,
        SessionLockEnabled = true,
        IpWhitelistEnabled = false,
        AuditNotificationsEnabled = true,
        ApiKeyRotationEnabled = false
    };

    private static SecuritySettingsResponse ToResponse(UserSecuritySettings settings) => new(
        settings.TwoFactorEnabled, settings.SessionLockEnabled, settings.IpWhitelistEnabled,
        settings.AuditNotificationsEnabled, settings.ApiKeyRotationEnabled);
}

public record SecuritySettingsRequest(bool TwoFactorEnabled, bool SessionLockEnabled, bool IpWhitelistEnabled, bool AuditNotificationsEnabled, bool ApiKeyRotationEnabled);
public record SecuritySettingsResponse(bool TwoFactorEnabled, bool SessionLockEnabled, bool IpWhitelistEnabled, bool AuditNotificationsEnabled, bool ApiKeyRotationEnabled);
