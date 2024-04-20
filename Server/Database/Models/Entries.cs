using System.ComponentModel.DataAnnotations;

namespace Server.Database.Models;

public abstract class Entry
{
    [Key, Required]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public required Guid ChartId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Chart Chart { get; set; }
}

public class CounterEntry : Entry
{
    [Required]
    public required uint Counter { get; set; }
}

public class ScaleEntry : Entry
{
    [Required]
    public required uint Rating { get; set; }
}

public class CheckmarkEntry : Entry
{
    [Required]
    public required bool Checked { get; set; }
}
