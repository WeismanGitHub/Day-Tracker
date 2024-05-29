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

        await entryService.CreateEntry(chart, entry);

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
        public uint? Rating { get; set; }
        public bool? Checked { get; set; }
        public uint? Count { get; set; }
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

    public class UpdateEntryBody
    {
        public uint? Rating { get; set; }
        public bool? Checked { get; set; }
        public uint? Count { get; set; }
    }

    private class UpdateEntryValidator : AbstractValidator<UpdateEntryBody>
    {
        public UpdateEntryValidator()
        {
            RuleFor(e => e)
                .Must(e => e.Count is not null || e.Checked is not null || e.Rating is not null)
                .WithMessage("Must have a new value.");
        }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpPost("{entryId:guid}", Name = "UpdateEntry")]
    public async Task<IActionResult> UpdateEntry(
        [FromRoute] Guid chartId,
        [FromRoute] Guid entryId,
        [FromBody] UpdateEntryBody body,
        ChartService chartService,
        EntryService entryService
    )
    {
        var result = new UpdateEntryValidator().Validate(body);

        if (!result.IsValid)
        {
            throw new ValidationException(result);
        }

        var accountId = HttpContext.GetUserId();
        var chart = await chartService.GetUserChart(chartId, accountId);

        if (chart is null)
        {
            throw new NotFoundException("Could not find chart.");
        }

        var entry = await entryService.GetEntry(chartId, entryId);

        if (entry is null)
        {
            throw new NotFoundException("Could not find entry.");
        }

        var updatedEntry = UpdateEntryObject(body, chart.Type, entry);
        await entryService.UpdateEntry(updatedEntry);

        return Ok();
    }

    private static Entry UpdateEntryObject(UpdateEntryBody body, ChartType type, Entry entry)
    {
        switch (type)
        {
            case ChartType.Scale:
                if (body.Rating is null)
                {
                    throw new BadRequestException("Invalid Rating");
                }

                var scaleEntry = (ScaleEntry)entry;
                scaleEntry.Rating = (uint)body.Rating;
                return scaleEntry;
            case ChartType.Counter:
                if (body.Count is null)
                {
                    throw new BadRequestException("Invalid Count");
                }

                var counterEntry = (CounterEntry)entry;
                counterEntry.Count = (uint)body.Count;
                return counterEntry;
            case ChartType.CheckMark:
                if (body.Checked is null)
                {
                    throw new BadRequestException("Invalid Value");
                }

                var castEntry = (CheckmarkEntry)entry;
                castEntry.Checked = (bool)body.Checked;
                return castEntry;
            default:
                throw new Exception("Something went wrong!");
        }
    }
}
