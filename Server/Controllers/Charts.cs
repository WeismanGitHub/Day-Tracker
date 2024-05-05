using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Server.Database.Models;
using Server.Database.Services;

namespace Server.Controllers;

public class ChartsController : CustomBase
{
    public class ChartModel
    {
        public required string Name { get; set; }
        public required ChartType Type { get; set; }
    }

    private class ChartValidator : AbstractValidator<ChartModel>
    {
        public ChartValidator()
        {
            RuleFor(u => u.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(50)
                .WithMessage("Name must be between 1 and 50 characters.");
        }
    }

    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Charts")]
    [HttpPost(Name = "CreateChart")]
    public async Task<IActionResult> CreateChart(
        [FromBody] ChartModel chartModel,
        ChartService service
    )
    {
        var result = new ChartValidator().Validate(chartModel);

        if (!result.IsValid)
        {
            throw new ValidationException(result);
        }

        var id = HttpContext.GetUserId();
        var chart = new Chart()
        {
            Name = chartModel.Name,
            Type = chartModel.Type,
            UserId = id,
        };

        await service.CreateChart(chart);

        return Created("", new { chart.Id });
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Charts")]
    [HttpDelete("{ChartId:Guid}", Name = "DeleteChart")]
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

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Charts")]
    [HttpGet("{ChartId:Guid}", Name = "GetChart")]
    public async Task<IActionResult> GetChart(Guid chartId, ChartService service)
    {
        var accountId = HttpContext.GetUserId();
        var chart = await service.GetChart(chartId, accountId);

        if (chart == null)
        {
            throw new NotFoundException("Could not find chart.");
        }

        return Ok(chart);
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
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
}
