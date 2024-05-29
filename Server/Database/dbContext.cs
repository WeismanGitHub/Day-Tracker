﻿namespace Server.Database;

using System;
using Microsoft.EntityFrameworkCore;
using Server.Database.Models;

public class DayTrackerContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Chart> Charts { get; set; }
    public DbSet<Entry> Entries { get; set; }

    public string DbPath { get; }

    public DayTrackerContext()
    {
        var folder = Environment.SpecialFolder.LocalApplicationData;
        var path = Environment.GetFolderPath(folder);
        DbPath = Path.Join(path, "daytracker.db");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasMany(u => u.Charts).WithOne(c => c.User);
        modelBuilder.Entity<Chart>().HasMany(c => c.Entries).WithOne(e => e.Chart);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlite($"Data Source={DbPath}");
    }
}
