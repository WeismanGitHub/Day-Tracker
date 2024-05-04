using Microsoft.EntityFrameworkCore;
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

    public async Task<Chart?> GetChart(Guid chartId, Guid userId)
    {
        return await _context
            .Charts.Where(chart => chart.UserId == userId && chart.Id == chartId)
            .FirstAsync();
    }

    public async Task DeleteChart(Chart chart)
    {
        _context.Remove(chart);
        await _context.SaveChangesAsync();
    }
}
