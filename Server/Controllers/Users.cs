using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Database.Services;

namespace Server.Controllers;

public class UsersController : CustomBase
{
    public class Credentials
    {
        public required string Name { get; set; }
        public required string Password { get; set; }
    }

    private class Validator : AbstractValidator<Credentials>
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
    public async Task<IActionResult> SignUp([FromBody] Credentials credentials, UserService service)
    {
        var result = new Validator().Validate(credentials);

        if (!result.IsValid)
        {
            throw new ValidationException(result);
        }

        var exists = await service.UserExists(credentials.Name);

        if (exists)
        {
            throw new UsernameTakenException();
        }

        var user = await service.CreateUser(credentials.Name, credentials.Password);

        await HttpContext.SignInHelper(user.Id);
        return Created();
    }

    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [AllowAnonymous]
    [Tags("Users")]
    [HttpPost("SignIn", Name = "SignIn")]
    public async Task<IActionResult> SignIn([FromBody] Credentials credentials, UserService service)
    {
        var result = new Validator().Validate(credentials);

        if (!result.IsValid)
        {
            throw new ValidationException(result);
        }

        var id = HttpContext.GetUserId();
        var user = await service.GetUser(id);

        if (user is null)
        {
            throw new BadRequestException("Invalid Credentials");
        }

        var passwordsMatch = Verify(credentials.Password, user.PasswordHash);

        if (!passwordsMatch)
        {
            throw new BadRequestException("Invalid Credentials");
        }

        await HttpContext.SignInHelper(user.Id);
        return Ok();
    }

    public class Account
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required int ChatCount { get; set; }
        public required DateTime CreatedAt { get; set; }
    }

    [ProducesResponseType(typeof(Account), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [Tags("Users", "Read")]
    [HttpGet("Account", Name = "GetAccount")]
    public async Task<IActionResult> GetAccount(UserService service)
    {
        var id = HttpContext.GetUserId();
        var user = await service.GetUser(id);

        if (user is null)
        {
            throw new NotFoundException("Could not find your account.");
        }

        return Ok(
            new Account()
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
        await HttpContext.SignOutAsync();

        return Ok();
    }
}
