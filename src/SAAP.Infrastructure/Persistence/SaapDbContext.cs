using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SAAP.Domain.Entities;

namespace SAAP.Infrastructure.Persistence;

public class SaapDbContext : IdentityDbContext<User, Role, Guid>
{
    public SaapDbContext(DbContextOptions<SaapDbContext> options) : base(options) { }

    public DbSet<AuditLog> AuditLogs { get; set; }
}