using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAAP.Infrastructure.Persistence;

namespace SAAP.API.Controllers;

[ApiController]
[Route("api/search")]
[Authorize]
public class SearchController(SaapDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(Array.Empty<SearchResult>());
        var term = q.Trim().ToLowerInvariant();
        var results = new[]
        {
            new SearchResult("Dashboard", "Sayfa", "/dashboard"), new SearchResult("Denetim Yönetimi", "Sayfa", "/audit"),
            new SearchResult("Raporlama ve Analitik", "Sayfa", "/reporting"), new SearchResult("Ayarlar ve Profil", "Sayfa", "/settings")
        }.Where(x => x.Title.ToLowerInvariant().Contains(term) || x.Category.ToLowerInvariant().Contains(term)).ToList();
        if (Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            results.AddRange(await dbContext.AuditLogs.AsNoTracking().Where(x => x.UserId == userId &&
                (x.Path.ToLower().Contains(term) || x.IpAddress.ToLower().Contains(term) || (x.UserEmail ?? "").ToLower().Contains(term)))
                .OrderByDescending(x => x.CreatedAt).Take(5).Select(x => new SearchResult($"{x.HttpMethod} {x.Path}", "Denetim kaydı", "/audit")).ToListAsync());
        }
        return Ok(results.Take(10));
    }
}

public record SearchResult(string Title, string Category, string Path);
