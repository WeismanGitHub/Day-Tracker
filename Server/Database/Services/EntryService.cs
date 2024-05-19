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

    public async Task<List<EntryDTO>> GetEntries(Guid chartId, DateTimeOffset end)
    {
        var startOfPreviousYear = new DateTimeOffset(end.Year - 1, 1, 1, 0, 0, 0, end.Offset);
        var endOfPreviousYear = new DateTimeOffset(end.Year - 1, 12, 31, 23, 59, 59, end.Offset);

        return await _context
            .Entries.Where(e => e.ChartId == chartId)
            .Where(e => e.CreatedAt >= startOfPreviousYear && e.CreatedAt <= endOfPreviousYear)
            .Select(e => new EntryDTO() { Id = e.Id, CreatedAt = e.CreatedAt, })
            .ToListAsync();
    }
}
