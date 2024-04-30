using Microsoft.EntityFrameworkCore;
using Server.Database.Models;

namespace Server.Database.Services;

public class UserService
{
    public DayTrackerContext _context { get; set; } = new();

    public async Task<User?> GetUser(Guid userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<bool> UserExists(string name)
    {
        return await _context.Users.AnyAsync(u => u.Name == name);
    }

    public async Task<User> CreateUser(string name, string password)
    {
        var user = await _context.Users.AddAsync(
            new() { Name = name, Password = BCrypt.Net.BCrypt.HashPassword(password) }
        );

        await _context.SaveChangesAsync();

        return user.Entity;
    }
}
