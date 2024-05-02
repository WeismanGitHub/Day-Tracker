﻿using FluentValidation.Results;

namespace Server;

public class CustomException(string message) : Exception(message) { }

public class UsernameTakenException(string message = "This username has been taken.")
    : CustomException(message) { }

public class ValidationException(ValidationResult res)
    : CustomException(res.Errors.First().ErrorMessage) { }

public class UnauthorizedException(string message = "Please login.") : CustomException(message) { }

public class NotFoundException(string message) : CustomException(message) { }

public class BadRequestException(string message) : CustomException(message) { }
