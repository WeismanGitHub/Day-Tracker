using System.ComponentModel.DataAnnotations;

namespace Server.Database.Models;

public class User
{
    [Key, Required]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public required string Name { get; set; }

    [Required]
    public required string Password { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public IList<Chart> Charts { get; set; } = [];
}
