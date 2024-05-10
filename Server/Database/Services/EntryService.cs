using Microsoft.EntityFrameworkCore;
using Server.Database.Models;

namespace Server.Database.Services;

public class EntryService
{
    public DayTrackerContext _context { get; set; } = new();

    public async Task CreateEntry(Chart chart, Entry entry)
    {
        var existingEntry = await _context
            .Entries.Where(e => (e.ChartId == chart.Id) && e.CreatedAt.Date == entry.CreatedAt.Date)
            .SingleOrDefaultAsync();

        if (existingEntry is not null)
        {
            throw new BadRequestException("An entry for today already exists.");
        }

        _context.Entries.Add(entry);
        await _context.SaveChangesAsync();
    }

    public async Task<Entry?> GetEntry(Guid chartId, Guid entryId)
    {
        return await _context
            .Entries.Where(e => (e.ChartId == chartId) && (e.Id == entryId))
            .SingleOrDefaultAsync();
    }

    public async Task DeleteEntry(Entry entry)
    {
        _context.Remove(entry);
        await _context.SaveChangesAsync();
    }
}
