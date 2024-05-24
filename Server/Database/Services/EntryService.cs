using Microsoft.EntityFrameworkCore;
using Server.Database.Models;
using static Server.Controllers.EntriesController;

namespace Server.Database.Services;

public class EntryService
{
    public DayTrackerContext _context { get; set; } = new();

    public async Task CreateEntry(Chart chart, Entry entry)
    {
        var existingEntry = await _context
            .Entries.Where(e =>
                (e.ChartId == chart.Id)
                && (e.Year == entry.Year)
                && (e.Month == entry.Month)
                && (e.Day == entry.Day)
            )
            .SingleOrDefaultAsync();

        if (existingEntry is not null)
        {
            throw new BadRequestException("An entry for this day already exists.");
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

    public async Task<List<EntryDTO>> GetEntries(Guid chartId, int year)
    {
        return await _context
            .Entries.Where(e => (e.ChartId == chartId) && (e.Year == year))
            .Select(e => new EntryDTO
            {
                Id = e.Id,
                Day = $"{e.Year}-{e.Month}-{e.Day}",
                Checked = e is CheckmarkEntry ? ((CheckmarkEntry)e).Checked : null,
                Count = e is CounterEntry ? ((CounterEntry)e).Count : null,
                Rating = e is ScaleEntry ? ((ScaleEntry)e).Rating : null,
            })
            .ToListAsync();
    }

    public async Task UpdateEntry(Entry entry)
    {
        _context.Entries.Update(entry);
        await _context.SaveChangesAsync();
    }
}
