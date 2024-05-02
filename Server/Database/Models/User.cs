using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Server.Database.Models;

[Index(nameof(Name), IsUnique = true)]
public class User
{
    [Key, Required]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(50), MinLength(1)]
    public required string Name { get; set; }

    [Required]
    public required string PasswordHash { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public IList<Chart> Charts { get; set; } = [];
}
