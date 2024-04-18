using System.ComponentModel.DataAnnotations;

namespace Server.Database.Models;

public class EntryBase
{
    [Key, Required]
    public required Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public required Guid ChartId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required Chart Chart { get; set; }
}

public class CounterEntry : EntryBase
{
    [Required]
    public required uint Counter { get; set; }
}

public class ScaleEntry : EntryBase
{
    [Required]
    public required uint Rating { get; set; }
}

public class CheckmarkEntry : EntryBase
{
    [Required]
    public required bool Checked { get; set; }
}
