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
        public required string Notes { get; set; }
        public required int Value { get; set; }
        public required DateTime Date { get; set; }
    }

    public class EntryIdDTO
    {
        public required Guid Id { get; set; }
    }

    private class CreateEntryValidator : AbstractValidator<CreateEntryBody>
    {
        public CreateEntryValidator()
        {
            RuleFor(u => u.Notes)
                .NotNull()
                .MaximumLength(500)
                .WithMessage("Notes must be between 1 and 500 characters.");
        }
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
        var result = new CreateEntryValidator().Validate(body);

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

        if (body.Date.Year > chart.CreatedAt.Year)
        {
            throw new BadRequestException("Invalid Year");
        }

        var entry = new Entry()
        {
            ChartId = chart.Id,
            Value = body.Value,
            Year = body.Date.Year,
            Month = body.Date.Month,
            Day = body.Date.Day,
            Notes = body.Notes,
        };

        await entryService.CreateEntry(entry);

        return Ok(new EntryIdDTO() { Id = entry.Id });
    }

    public class UpdateEntryBody
    {
        public int? Value { get; set; }
        public string? Notes { get; set; }
    }

    private class UpdateEntryValidator : AbstractValidator<UpdateEntryBody>
    {
        public UpdateEntryValidator()
        {
            RuleFor(e => e).Must(e => (e.Value is not null) || (e.Notes is not null));

            RuleFor(e => e.Notes)
                .NotNull()
                .MaximumLength(500)
                .WithMessage("Notes must be between 1 and 500 characters.");
        }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpPatch("{entryId:guid}", Name = "UpdateEntry")]
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
            throw new NotFiniteNumberException("Could not find entry.");
        }

        if (body.Value is not null)
        {
            entry.Value = (int)body.Value;
        }

        if (body.Notes is not null)
        {
            entry.Notes = body.Notes;
        }

        await entryService.UpdateEntry(entry);

        return Ok();
    }

    public class DeleteEntryBody
    {
        public required DateTime Date { get; set; }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [HttpDelete(Name = "DeleteEntry")]
    public async Task<IActionResult> DeleteEntry(
        [FromRoute] Guid chartId,
        [FromBody] DeleteEntryBody body,
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

        // Must make sure entry belongs to chart.
        var entry = await entryService.GetEntry(chartId, body.Date);

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
        public required string Day { get; set; } // Optimized for front-end.
        public required int Value { get; set; }
        public string? Notes { get; set; }
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
