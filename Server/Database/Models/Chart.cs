using System.ComponentModel.DataAnnotations;

namespace Server.Database.Models;

public enum ChartType
{
    Counter,
    CheckMark,
    Scale
}

public class Chart
{
    [Key, Required]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public required Guid UserId { get; set; }

    [Required, MaxLength(50), MinLength(1)]
    public required string Name { get; set; }

    [Required]
    public required ChartType Type { get; set; }

    [Required]
    public DateTimeOffset CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; }
    public IList<Entry> Entries { get; set; } = [];
}
