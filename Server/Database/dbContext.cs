namespace Server.Database;

using System;
using Microsoft.EntityFrameworkCore;
using Server.Database.Models;

public class DayTrackerContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Chart> Charts { get; set; }

    public DbSet<CounterEntry> CounterEntries { get; set; }
    public DbSet<CheckmarkEntry> CheckmarkEntries { get; set; }
    public DbSet<ScaleEntry> ScaleEntries { get; set; }

    public string DbPath { get; }

    public DayTrackerContext()
    {
        var folder = Environment.SpecialFolder.LocalApplicationData;
        var path = Environment.GetFolderPath(folder);
        DbPath = Path.Join(path, "daytracker.db");
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options) =>
        options.UseSqlite($"Data Source={DbPath}");
}
