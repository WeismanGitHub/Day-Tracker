using System.ComponentModel.DataAnnotations;

namespace Server.Database.Models;

public enum ChartType {
	Counter,
	CheckMark,
	Scale
}

public class Chart {
	[Key, Required]
	public required Guid Id { get; set; } = Guid.NewGuid();
	[Required]
	public required Guid UserId { get; set; }
	[Required]
	public required string Name { get; set; }
	[Required]
	public required ChartType Type { get; set; }
	[Required]
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public required User User { get; set; }
}
