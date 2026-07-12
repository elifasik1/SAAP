using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SAAP.Domain.Entities;

namespace SAAP.Infrastructure.Persistence;

public class SaapDbContext : IdentityDbContext<User, Role, Guid>
{
    public SaapDbContext(DbContextOptions<SaapDbContext> options) : base(options) { }

    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<UserSecuritySettings> UserSecuritySettings { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<UserSecuritySettings>().HasKey(x => x.UserId);
        builder.Entity<Notification>().HasIndex(x => new { x.UserId, x.CreatedAt });
    }
}
