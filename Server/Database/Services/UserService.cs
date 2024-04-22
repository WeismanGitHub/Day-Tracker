using Server.Database.Models;

namespace Server.Database.Services;

public class UserService
{
    public DayTrackerContext _context { get; set; } = new();

    public async Task<User?> GetUser(Guid userId)
    {
        return await _context.Users.FindAsync(userId);
    }
}
