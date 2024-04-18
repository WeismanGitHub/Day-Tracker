using System.ComponentModel.DataAnnotations;

namespace Server.Database.Models;

public class CounterEntry
{
    [Key, Required]
    public required Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public required Guid ChartId { get; set; }

    [Required]
    public required uint Counter { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public required Chart Chart { get; set; }
}
