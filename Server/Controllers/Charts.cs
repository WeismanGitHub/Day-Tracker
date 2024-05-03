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
    [Tags("Create", "Charts")]
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

        return Created("", new { Id = chart.Id });
    }
}
