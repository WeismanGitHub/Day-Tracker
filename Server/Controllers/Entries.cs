using Microsoft.AspNetCore.Mvc;
using Server.Database.Models;
using Server.Database.Services;

namespace Server.Controllers;

[Route("Api/Charts/{chartId:guid}/Entries")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[Tags("Entries")]
public class EntriesController : CustomBase
{
    public class UpsertEntryBody
    {
        public required int NumberValue { get; set; }
        public required DateTime Date { get; set; }
    }

    public class EntryIdDTO
    {
        public required Guid Id { get; set; }
    }

    [ProducesResponseType(typeof(EntryIdDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpPost(Name = "UpsertEntry")]
    public async Task<IActionResult> UpsertEntry(
        [FromRoute] Guid chartId,
        [FromBody] UpsertEntryBody body,
        ChartService chartService,
        EntryService entryService
    )
    {
        var accountId = HttpContext.GetUserId();
        var chart = await chartService.GetUserChart(chartId, accountId);

        if (chart is null)
        {
            throw new NotFoundException("Could not find chart.");
        }

        if (body.Date.Year > chart.CreatedAt.Year)
        {
            throw new BadRequestException("Invalid Year");
        }

        var entry = new Entry()
        {
            ChartId = chart.Id,
            NumberValue = body.NumberValue,
            Year = body.Date.Year,
            Month = body.Date.Month,
            Day = body.Date.Day,
        };

        await entryService.UpsertEntry(entry);

        return Ok(new EntryIdDTO() { Id = entry.Id });
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpDelete("{entryId:guid}", Name = "DeleteEntry")]
    public async Task<IActionResult> DeleteEntry(
        [FromRoute] Guid chartId,
        [FromRoute] Guid entryId,
        ChartService chartService,
        EntryService entryService
    )
    {
        var accountId = HttpContext.GetUserId();
        var chart = await chartService.GetUserChart(chartId, accountId);

        // If the chart belongs to the user then the entry also belongs to the user.
        if (chart is null)
        {
            throw new NotFoundException("Could not find chart.");
        }

        var entry = await entryService.GetEntry(chartId, entryId);

        if (entry is null)
        {
            throw new NotFoundException("Could not find entry.");
        }

        await entryService.DeleteEntry(entry);

        return Ok();
    }

    public class EntryDTO
    {
        public required Guid Id { get; set; } // Optimized for front-end.
        public required string Day { get; set; }
        public required int NumberValue { get; set; }
    }

    [ProducesResponseType(typeof(List<EntryDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpGet(Name = "GetEntries")]
    public async Task<IActionResult> GetEntries(
        [FromRoute] Guid chartId,
        [FromQuery] int year,
        ChartService chartService,
        EntryService entryService
    )
    {
        var accountId = HttpContext.GetUserId();
        var chart = await chartService.GetUserChart(chartId, accountId);

        if (chart is null)
        {
            throw new NotFoundException("Could not find chart.");
        }

        var entries = await entryService.GetEntries(chartId, year);

        if (entries is null)
        {
            throw new NotFoundException("Could not retrieve entries.");
        }

        return Ok(entries);
    }
}
