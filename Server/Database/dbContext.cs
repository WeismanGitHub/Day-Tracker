namespace Server.Database;

using Microsoft.EntityFrameworkCore;
using Server.Database.Models;
using System;


public class DayTrackerContext : DbContext
{
    public DbSet<User> Users { get; set; }
	public DbSet<Chart> Charts { get; set; }

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
