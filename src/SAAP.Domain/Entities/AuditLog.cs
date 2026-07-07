namespace SAAP.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string IpAddress { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public long DurationMs { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}