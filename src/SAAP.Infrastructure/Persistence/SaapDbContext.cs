using Microsoft.EntityFrameworkCore;
using SAAP.Domain.Entities;

namespace SAAP.Infrastructure.Persistence;

public class SaapDbContext : DbContext
{
    public SaapDbContext(DbContextOptions<SaapDbContext> options) : base(options) { }

    public DbSet<AuditLog> AuditLogs { get; set; }
}