using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Server.Database.Models;

namespace Server;

public static class Extensions
{
    public static bool IsValidPassword(this string password)
    {
        if (password == null)
            return false;

        var meetsLengthRequirements = password.Length <= 72 && password.Length >= 10;
        var hasUpperCaseLetter = false;
        var hasLowerCaseLetter = false;
        var hasDecimalDigit = false;

        if (meetsLengthRequirements)
        {
            foreach (var c in password)
            {
                if (char.IsUpper(c))
                    hasUpperCaseLetter = true;
                else if (char.IsLower(c))
                    hasLowerCaseLetter = true;
                else if (char.IsDigit(c))
                    hasDecimalDigit = true;
            }
        }

        return meetsLengthRequirements
            && hasUpperCaseLetter
            && hasLowerCaseLetter
            && hasDecimalDigit;
    }

    public static Guid? GetUserId(this HttpContext context)
    {
        var value = context.User.Claims.FirstOrDefault()?.Value;
        var isValidGuid = Guid.TryParse(value, out var guid);
        return isValidGuid ? guid : null;
    }

    public static async Task SignInHelper(this HttpContext context, Guid id)
    {
        var claims = new List<Claim>() { new(ClaimTypes.NameIdentifier, id.ToString()) };

        var claimsIdentity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30)
        };

        await context.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties
        );
    }
}
