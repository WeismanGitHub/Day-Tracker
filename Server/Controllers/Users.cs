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

    private class CredentialsValidator : AbstractValidator<Credentials>
    {
        public CredentialsValidator()
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
    [Tags("Users")]
    [HttpPost("SignUp", Name = "SignUp")]
    public async Task<IActionResult> SignUp([FromBody] Credentials credentials, UserService service)
    {
        var result = new CredentialsValidator().Validate(credentials);

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
        var result = new CredentialsValidator().Validate(credentials);

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
    [Tags("Users")]
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

    public class DeletionCredentials
    {
        public required string Password { get; set; }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [Tags("Users")]
    [HttpDelete("Account", Name = "DeleteAccount")]
    public async Task<IActionResult> DeleteAccount(
        [FromBody] DeletionCredentials credentials,
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

    public class NewData
    {
        public string? Name { get; set; }
        public string? Password { get; set; }
    }

    public class UpdateModel
    {
        public required NewData NewData { get; set; }
        public required string CurrentPassword { get; set; }
    }

    private class UpdateValidator : AbstractValidator<UpdateModel>
    {
        public UpdateValidator()
        {
            RuleFor(u => u.CurrentPassword)
                .NotEmpty()
                .NotNull()
                .MaximumLength(50)
                .Must(p => p.IsValidPassword())
                .WithMessage("Current Password doesn't meet the criteria for a valid password.");

            RuleFor(u => u.NewData.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(50)
                .WithMessage("Username must be between 1 and 50 characters.");

            RuleFor(u => u.NewData.Password)
                .NotEmpty()
                .MaximumLength(72)
                .Must(p => p.IsValidPassword())
                .WithMessage("Password is invalid.");

            RuleFor(u => u)
                .Must(u => !(u.NewData.Password is null && u.NewData.Name is null))
                .WithMessage("Must update at least one thing.");
        }
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [Tags("Users")]
    [HttpPatch("Account", Name = "UpdateAccount")]
    public async Task<IActionResult> UpdateAccount(
        [FromBody] UpdateModel updateModel,
        UserService service
    )
    {
        var result = new UpdateValidator().Validate(updateModel);

        if (!result.IsValid)
        {
            throw new ValidationException(result);
        }

        var id = HttpContext.GetUserId();
        var account = await service.GetUser(id);

        if (account is null)
        {
            throw new NotFoundException("Could not find your account.");
        }

        var newName = updateModel.NewData.Name;
        var newPassword = updateModel.NewData.Password;

        if (newName is not null && await service.UserExists(newName))
        {
            throw new UsernameTakenException();
        }

        var passwordsMatch = Verify(updateModel.CurrentPassword, account.PasswordHash);

        if (!passwordsMatch)
        {
            throw new BadRequestException("Invalid Password");
        }

        if (newName is not null)
        {
            account.Name = newName;
        }

        if (newPassword is not null)
        {
            account.PasswordHash = HashPassword(newPassword);
        }

        await service.UpdateUser(account);

        return Ok();
    }
}
