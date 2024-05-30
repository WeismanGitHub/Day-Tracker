using Microsoft.EntityFrameworkCore;
using Server.Database.Models;
using static Server.Controllers.EntriesController;

namespace Server.Database.Services;

public class EntryService
{
    public DayTrackerContext _context { get; set; } = new();

    public async Task CreateEntry(Entry entry)
    {
        var existingEntry = await _context
            .Entries.Where(e =>
                (e.ChartId == entry.ChartId)
                && (e.Year == entry.Year)
                && (e.Month == entry.Month)
                && (e.Day == entry.Day)
            )
            .SingleOrDefaultAsync();

        if (existingEntry is not null)
        {
            throw new BadRequestException("An entry for this date already exists.");
        }

        _context.Entries.Add(entry);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateEntry(Entry entry)
    {
        _context.Entries.Update(entry);
        await _context.SaveChangesAsync();
    }

    public async Task<Entry?> GetEntry(Guid chartId, Guid entryId)
    {
        return await _context
            .Entries.Where(e => (e.ChartId == chartId) && (e.Id == entryId))
            .SingleOrDefaultAsync();
    }

    public async Task<Entry?> GetEntry(Guid chartId, DateTime date)
    {
        return await _context
            .Entries.Where(e =>
                (e.ChartId == chartId)
                && (e.Year == date.Year)
                && (e.Month == date.Month)
                && (e.Day == date.Day)
            )
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
                // Optimized for front-end.
                Day =
                    $"{e.Year}-{e.Month.ToString().PadLeft(2, '0')}-{e.Day.ToString().PadLeft(2, '0')}",
                Value = e.Value,
                Notes = e.Notes,
            })
            .ToListAsync();
    }
}
