using Microsoft.AspNetCore.Mvc;
using Server.Database.Models;
using Server.Database.Services;

namespace Server.Controllers;

[Route("Api/Charts/{chartId:guid}/Entries")]
[Tags("Entries")]
public class EntriesController : CustomBase
{
    public class CreateEntryBody
    {
        public uint? Count { get; set; }
        public DateTimeOffset Date { get; set; }
    }

    public class EntryIdDTO
    {
        public required Guid Id { get; set; }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpPost(Name = "CreateEntry")]
    public async Task<IActionResult> CreateCounterEntry(
        [FromRoute] Guid chartId,
        [FromBody] CreateEntryBody body,
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

        if (chart.Type is not ChartType.Counter)
        {
            throw new BadRequestException("Invalid chart type.");
        }

        var entry = new CounterEntry()
        {
            ChartId = chartId,
            Count = body.Count,
            CreatedAt = body.Date
        };

        await entryService.CreateCounterEntry(chart, entry);

        return Ok();
    }
}
