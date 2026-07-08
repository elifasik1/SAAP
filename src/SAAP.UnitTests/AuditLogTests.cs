using SAAP.Domain.Entities;
using Xunit;

namespace SAAP.UnitTests;

public class AuditLogTests
{
    [Fact]
    public void AuditLog_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var auditLog = new AuditLog();

        // Assert
        Assert.NotEqual(Guid.Empty, auditLog.Id);
        Assert.Equal(string.Empty, auditLog.IpAddress);
        Assert.Equal(string.Empty, auditLog.Path);
        Assert.Equal(0, auditLog.StatusCode);
        Assert.Equal(0, auditLog.DurationMs);
        Assert.True((DateTime.UtcNow - auditLog.CreatedAt).TotalSeconds < 5);
    }
}
