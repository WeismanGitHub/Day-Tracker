using FluentValidation.Results;

namespace Server;

public class CustomException(string message) : Exception(message) { }

public class UsernameTakenException(string message = "This username has been taken.")
    : CustomException(message) { }

public class ValidationException(ValidationResult res)
    : CustomException(res.Errors.First().ErrorMessage) { }
