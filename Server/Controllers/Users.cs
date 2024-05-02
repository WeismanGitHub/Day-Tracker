using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Database.Services;

namespace Server.Controllers;

public class UsersController : CustomBase
{
    public class SignupModel
    {
        public required string Name { get; set; }
        public required string Password { get; set; }
    }

    private class Validator : AbstractValidator<SignupModel>
    {
        public Validator()
        {
            RuleFor(u => u.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(50)
                .WithMessage("Username must be between 1 and 50 characters.");

            RuleFor(u => u.Password)
                .NotEmpty()
                .NotNull()
                .MaximumLength(72)
                .Must(p => p.IsValidPassword())
                .WithMessage("Password is invalid.");
        }
    }

    [ProducesResponseType(StatusCodes.Status201Created | StatusCodes.Status400BadRequest)]
    [AllowAnonymous]
    [Tags("Create", "Users")]
    [HttpPost(Name = "Signup")]
    public async Task<IActionResult> Signup([FromBody] SignupModel model, UserService service)
    {
        var validationResult = new Validator().Validate(model);

        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult);
        }

        var exists = await service.UserExists(model.Name);

        if (exists)
        {
            throw new UsernameTakenException();
        }

        var user = await service.CreateUser(model.Name, model.Password);

        if (user is null)
        {
            throw new NotFoundException("Could not find your account.");
        }

        await HttpContext.SignInHelper(user.Id);
        return Created();
    }

    public class SelfModel
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required DateTime CreatedAt { get; set; }
    }

    [ProducesResponseType(
        StatusCodes.Status200OK | StatusCodes.Status404NotFound | StatusCodes.Status401Unauthorized
    )]
    [AllowAnonymous]
    [Tags("Users", "Get")]
    [HttpGet("Self", Name = "GetSelf")]
    public async Task<IActionResult> GetSelf(UserService service)
    {
        var id = HttpContext.GetUserId();

        if (id is null)
        {
            throw new UnauthorizedException();
        }

        var user = await service.GetUser((Guid)id);

        if (user is null)
        {
            throw new NotFoundException("Could not find your account.");
        }

        return Ok(
            new SelfModel()
            {
                Id = user.Id,
                Name = user.Name,
                CreatedAt = user.CreatedAt,
            }
        );
    }
}
