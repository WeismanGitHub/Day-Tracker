using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Server.Database.Services;

namespace Server.Controllers;

public class UsersController : CustomBase
{
    public class UserModel
    {
        public required string Name { get; set; }
        public required string Password { get; set; }
    }

    private class Validator : AbstractValidator<UserModel>
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

    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [AllowAnonymous]
    [Tags("Create", "Users")]
    [HttpPost("SignUp", Name = "SignUp")]
    public async Task<IActionResult> SignUp([FromBody] UserModel model, UserService service)
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

        await HttpContext.SignInHelper(user.Id);
        return Created();
    }

    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [AllowAnonymous]
    [Tags("Users")]
    [HttpPost("SignIn", Name = "SignIn")]
    public async Task<IActionResult> SignIn([FromBody] UserModel model, UserService service)
    {
        var validationResult = new Validator().Validate(model);

        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult);
        }

        var id = HttpContext.GetUserId();
        var user = await service.GetUser(id);

        if (user is null)
        {
            throw new BadRequestException("Invalid Credentials");
        }

        var passwordsMatch = Verify(model.Password, user.PasswordHash);

        if (!passwordsMatch)
        {
            throw new BadRequestException("Invalid Credentials");
        }

        await HttpContext.SignInHelper(user.Id);
        return Ok();
    }

    public class SelfModel
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required int ChatCount { get; set; }
        public required DateTime CreatedAt { get; set; }
    }

    [ProducesResponseType(typeof(SelfModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Users", "Get")]
    [HttpGet("Self", Name = "GetSelf")]
    public async Task<IActionResult> GetSelf(UserService service)
    {
        var id = HttpContext.GetUserId();
        var user = await service.GetUser(id);

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
                ChatCount = user.Charts.Count
            }
        );
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Users")]
    [HttpPost("SignOut", Name = "SignOut")]
    public async Task<IActionResult> SignOut()
    {
        await HttpContext.SignOutAsync();
        return Ok();
    }

    public class DeleteCredentials
    {
        public required string Password { get; set; }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [Tags("Users", "Delete")]
    [HttpDelete("Account", Name = "DeleteAccount")]
    public async Task<IActionResult> DeleteAccount(
        [FromBody] DeleteCredentials credentials,
        UserService service
    )
    {
        var id = HttpContext.GetUserId();
        var account = await service.GetUser(id);

        if (account is null)
        {
            throw new NotFoundException("Could not find your account.");
        }

        var passwordsMatch = Verify(credentials.Password, account.PasswordHash);

        if (!passwordsMatch)
        {
            throw new BadRequestException("Invalid Password");
        }

        await service.DeleteUser(account);

        return Ok();
    }
}
