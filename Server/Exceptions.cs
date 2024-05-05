using FluentValidation.Results;

namespace Server;

public abstract class CustomException(string title, string message, int status) : Exception(message)
{
    public string Title { get; } = title;
    public int Status { get; } = status;
}

public class UsernameTakenException(string message = "This username has been taken.")
    : CustomException("Conflict", message, StatusCodes.Status409Conflict) { }

public class ValidationException(ValidationResult res)
    : CustomException(
        "Validation Exception",
        res.Errors.First().ErrorMessage,
        StatusCodes.Status400BadRequest
    ) { }

public class UnauthorizedException(string message = "Please login.")
    : CustomException("Unauthorized", message, StatusCodes.Status401Unauthorized) { }

public class NotFoundException(string message)
    : CustomException("Not Found", message, StatusCodes.Status404NotFound) { }

public class BadRequestException(string message)
    : CustomException("Bad Request", message, StatusCodes.Status400BadRequest) { }
