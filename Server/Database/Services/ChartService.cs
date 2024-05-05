using Microsoft.EntityFrameworkCore;
using Server.Database.Models;
using static Server.Controllers.ChartsController;

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
            .Charts.Where(c => c.UserId == userId && c.Id == chartId)
            .FirstOrDefaultAsync();
    }

    public async Task DeleteChart(Chart chart)
    {
        _context.Remove(chart);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ChartDTO>> GetUserCharts(Guid userId)
    {
        return await _context
            .Charts.Where(c => c.UserId == userId)
            .Select(c => new ChartDTO()
            {
                Name = c.Name,
                Type = c.Type,
                Id = c.Id,
                CreatedAt = c.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task UpdateChart(Chart chart)
    {
        _context.Charts.Update(chart);
        await _context.SaveChangesAsync();
    }
}
