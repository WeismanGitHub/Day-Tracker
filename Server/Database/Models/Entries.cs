using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Server.Database.Models;

[Index(nameof(ChartId))]
[Index(nameof(Year))]
public class Entry
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

    [Required]
    public required int NumberValue { get; set; }

    public Chart Chart { get; set; }
}
