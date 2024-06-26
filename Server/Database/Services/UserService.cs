﻿using Microsoft.EntityFrameworkCore;
using Server.Database.Models;

namespace Server.Database.Services;

public class UserService
{
    public DayTrackerContext _context { get; set; }

    public UserService(IConfiguration configuration)
    {
        _context = new(configuration);
    }

    public async Task<User?> GetUser(Guid userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<User?> GetUser(string name)
    {
        return await _context.Users.Where(u => u.Name == name).SingleOrDefaultAsync();
    }

    public async Task<bool> UserExists(string name)
    {
        return await _context.Users.AnyAsync(u => u.Name == name);
    }

    public async Task<User> CreateUser(string name, string password)
    {
        var user = await _context.Users.AddAsync(
            new() { Name = name, PasswordHash = HashPassword(password) }
        );

        await _context.SaveChangesAsync();

        return user.Entity;
    }

    public async Task DeleteUser(User user)
    {
        _context.Remove(user);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateUser(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }
}
