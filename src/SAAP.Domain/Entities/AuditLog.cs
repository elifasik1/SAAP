namespace SAAP.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string IpAddress { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string HttpMethod { get; set; } = "GET";
    public int StatusCode { get; set; }
    public long DurationMs { get; set; }
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}