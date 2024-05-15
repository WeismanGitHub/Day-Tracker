using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Server.Database.Models;
using Server.Database.Services;

namespace Server.Controllers;

[Route("Api/Charts/{chartId:guid}/Entries")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[Tags("Entries")]
public class EntriesController : CustomBase
{
    public class CreateEntryBody
    {
        public required ChartType Type { get; set; }
        public uint? Rating { get; set; }
        public bool? Checked { get; set; }
        public uint? Count { get; set; }
        public required DateTimeOffset Date { get; set; }
    }

    private class CreateEntryValidator : AbstractValidator<CreateEntryBody>
    {
        public CreateEntryValidator()
        {
            RuleFor(e => e.Type)
                .NotEmpty()
                .NotNull()
                .Must(t => Enum.IsDefined(typeof(ChartType), t))
                .WithMessage("Invalid chart type.");

            RuleFor(e => e)
                .Must(e => e.Count is not null || e.Checked is not null || e.Rating is not null)
                .WithMessage("Must have a value for the entry.");
        }
    }

    public class EntryIdDTO
    {
        public required Guid Id { get; set; }
    }

    [ProducesResponseType(typeof(EntryIdDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpPost(Name = "CreateEntry")]
    public async Task<IActionResult> CreateEntry(
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

        var entry = CreateEntryObject(body, chart);
        await entryService.CreateEntry(chart, entry);

        return Ok(new EntryIdDTO() { Id = entry.Id });
    }

    private static Entry CreateEntryObject(CreateEntryBody body, Chart chart)
    {
        switch (chart.Type)
        {
            case ChartType.Scale:
                if (body.Rating is null)
                {
                    throw new BadRequestException("Rating cannot be null in a scale entry.");
                }

                return new ScaleEntry()
                {
                    ChartId = chart.Id,
                    Rating = (uint)body.Rating,
                    CreatedAt = body.Date
                };
            case ChartType.Counter:
                if (body.Count is null)
                {
                    throw new BadRequestException("Count cannot be null in a counter entry.");
                }

                return new CounterEntry()
                {
                    ChartId = chart.Id,
                    Count = (uint)body.Count,
                    CreatedAt = body.Date
                };
            case ChartType.CheckMark:
                if (body.Checked is null)
                {
                    throw new BadRequestException("Checked cannot be null in a checkmark entry.");
                }

                return new CheckmarkEntry()
                {
                    ChartId = chart.Id,
                    Checked = (bool)body.Checked,
                    CreatedAt = body.Date
                };
            default:
                throw new BadRequestException("Invalid Type");
        }
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
        public required Guid Id { get; set; }
        public required DateTimeOffset CreatedAt { get; set; }
    }

    [ProducesResponseType(typeof(List<EntryDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpGet(Name = "GetEntries")]
    public async Task<IActionResult> GetEntries(
        [FromRoute] Guid chartId,
        [FromQuery] DateTimeOffset end,
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

        var entries = await entryService.GetEntries(chartId, end);

        if (entries is null)
        {
            throw new NotFoundException("Could not retrieve entries.");
        }

        return Ok(entries);
    }
}
