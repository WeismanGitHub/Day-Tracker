using Server.Database.Models;

namespace Server.Database.Services;

public class ChartService
{
    public DayTrackerContext _context { get; set; } = new();

    public async Task CreateChart(Chart chart)
    {
        await _context.Charts.AddAsync(chart);
        await _context.SaveChangesAsync();
    }
}
