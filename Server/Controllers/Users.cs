using FluentValidation;
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
    [Tags("Create", "User")]
    [HttpPost(Name = "Signup")]
    public async Task<IActionResult> Signup(
        [FromBody] SignupModel model,
        //HttpResponse res,
        UserService service
    //Configuration config
    )
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

        //        var user = await service.CreateUser(model.Name, model.Password);

        //        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.Jwt.Secret));
        //        var claims = new List<Claim>() { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) };

        //        var token = new JwtSecurityToken(
        //            issuer: config.Jwt.ValidIssuer,
        //            audience: config.Jwt.ValidAudience,
        //            expires: DateTime.Now.AddMonths(1),
        //            claims: claims,
        //            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        //        );

        //        res.Cookies.Append("AuthCookie", token.ToString());

        return Created();
    }
}
