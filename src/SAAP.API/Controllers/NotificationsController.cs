using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAAP.Infrastructure.Persistence;

namespace SAAP.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(SaapDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var notifications = await dbContext.Notifications.AsNoTracking().Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt).Take(50)
            .Select(x => new NotificationResponse(x.Id, x.Type, x.Message, x.CreatedAt, x.IsRead)).ToListAsync();
        return Ok(notifications);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var notification = await dbContext.Notifications.SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (notification is null) return NotFound();
        notification.IsRead = true;
        await dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        await dbContext.Notifications.Where(x => x.UserId == userId && !x.IsRead)
            .ExecuteUpdateAsync(x => x.SetProperty(n => n.IsRead, true));
        return NoContent();
    }

    private Guid? GetUserId() => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}

public record NotificationResponse(Guid Id, string Type, string Message, DateTime CreatedAt, bool IsRead);
