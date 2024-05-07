using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Database.Models;
using Server.Database.Services;

namespace Server.Controllers;

public class ChartsController : CustomBase
{
    public class CreateChartBody
    {
        public required string Name { get; set; }
        public required ChartType Type { get; set; }
    }

    private class CreateChartValidator : AbstractValidator<CreateChartBody>
    {
        public CreateChartValidator()
        {
            RuleFor(c => c.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(50)
                .WithMessage("Name must be between 1 and 50 characters.");

            RuleFor(c => c.Type)
                .NotEmpty()
                .NotNull()
                .Must(t => Enum.IsDefined(typeof(ChartType), t))
                .WithMessage("Invalid chart type.");
        }
    }

    public class ChartIdDTO
    {
        public required Guid Id { get; set; }
    }

    [ProducesResponseType(typeof(ChartIdDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Charts")]
    [HttpPost(Name = "CreateChart")]
    public async Task<IActionResult> CreateChart(
        [FromBody] CreateChartBody body,
        ChartService service
    )
    {
        var result = new CreateChartValidator().Validate(body);

        if (!result.IsValid)
        {
            throw new ValidationException(result);
        }

        var id = HttpContext.GetUserId();
        var chart = new Chart()
        {
            Name = body.Name,
            Type = body.Type,
            UserId = id,
        };

        await service.CreateChart(chart);

        return Created("", new ChartIdDTO() { Id = chart.Id });
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Charts")]
    [HttpDelete("{chartId:Guid}", Name = "DeleteChart")]
    public async Task<IActionResult> DeleteChart(Guid chartId, ChartService service)
    {
        var accountId = HttpContext.GetUserId();
        var chart = await service.GetChart(chartId, accountId);

        if (chart == null)
        {
            throw new NotFoundException("Could not find chart.");
        }

        await service.DeleteChart(chart);

        return Ok();
    }

    [ProducesResponseType(typeof(ChartDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Charts")]
    [HttpGet("{chartId:guid}", Name = "GetChart")]
    public async Task<IActionResult> GetChart([FromRoute] Guid chartId, ChartService service)
    {
        var accountId = HttpContext.GetUserId();
        var chart = await service.GetChart(chartId, accountId);

        if (chart == null)
        {
            throw new NotFoundException("Could not find chart.");
        }

        return Ok(
            new ChartDTO()
            {
                Id = chartId,
                Name = chart.Name,
                Type = chart.Type,
                CreatedAt = chart.CreatedAt
            }
        );
    }

    public class ChartDTO
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required ChartType Type { get; set; }
        public required DateTimeOffset CreatedAt { get; set; }
    }

    [ProducesResponseType(typeof(List<ChartDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Charts")]
    [HttpGet(Name = "GetCharts")]
    public async Task<IActionResult> GetCharts(ChartService service)
    {
        var accountId = HttpContext.GetUserId();
        var charts = await service.GetUserCharts(accountId);

        if (charts == null)
        {
            throw new NotFoundException("Could not find your charts.");
        }

        return Ok(charts);
    }

    public class UpdateChartBody
    {
        public required string Name { get; set; }
    }

    private class UpdateChartValidator : AbstractValidator<UpdateChartBody>
    {
        public UpdateChartValidator()
        {
            RuleFor(c => c.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(50)
                .WithMessage("Name must be between 1 and 50 characters.");
        }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [Tags("Charts")]
    [HttpPatch("{chartId:guid}", Name = "UpdateChart")]
    public async Task<IActionResult> UpdateChart(
        [FromRoute] Guid chartId,
        [FromBody] UpdateChartBody body,
        ChartService service
    )
    {
        var result = new UpdateChartValidator().Validate(body);

        if (!result.IsValid)
        {
            throw new ValidationException(result);
        }

        var accountId = HttpContext.GetUserId();
        var chart = await service.GetChart(chartId, accountId);

        if (chart is null)
        {
            throw new NotFoundException("Could not find chart.");
        }

        chart.Name = body.Name;

        await service.UpdateChart(chart);

        return Ok();
    }
}

[ApiController]
[Authorize]
[Route("Api/Charts/Counters")]
public class CounterChartsController : ControllerBase
{
    public class CreateEntryBodyRequest
    {
        public uint Count { get; set; }
        public DateTimeOffset Date { get; set; }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [Tags("CounterCharts", "Charts")]
    [HttpPost("{chartId:guid}", Name = "CreateCounterEntry")]
    public async Task<IActionResult> CreateCounterEntry(
        [FromRoute] Guid chartId,
        [FromBody] CreateEntryBodyRequest body,
        ChartService chartService,
        EntryService entryService
    )
    {
        var accountId = HttpContext.GetUserId();
        var chart = await chartService.GetChart(chartId, accountId);

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
