namespace Server.Database;

using Microsoft.EntityFrameworkCore;
using Server.Database.Models;

public class DayTrackerContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Chart> Charts { get; set; }
    public DbSet<Entry> Entries { get; set; }

    private readonly IConfiguration _configuration;

    public DayTrackerContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasMany(u => u.Charts).WithOne(c => c.User);
        modelBuilder.Entity<Chart>().HasMany(c => c.Entries).WithOne(e => e.Chart);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        options.UseNpgsql(connectionString);
    }
}
