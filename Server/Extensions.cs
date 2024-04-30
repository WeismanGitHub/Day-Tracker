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
}
