namespace SAAP.Domain.Entities;

public class UserSecuritySettings
{
    public Guid UserId { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool SessionLockEnabled { get; set; }
    public bool IpWhitelistEnabled { get; set; }
    public bool AuditNotificationsEnabled { get; set; }
    public bool ApiKeyRotationEnabled { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
