using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Server.Database.Models;

[Index(nameof(ChartId))]
[Index(nameof(Year))]
public abstract class Entry
{
    [Key, Required]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public required Guid ChartId { get; set; }

    [Required]
    public required int Year { get; set; }

    [Required]
    public required int Month { get; set; }

    [Required]
    public required int Day { get; set; }

    public Chart Chart { get; set; }
}

public class CounterEntry : Entry
{
    [Required]
    public required uint Count { get; set; }
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
