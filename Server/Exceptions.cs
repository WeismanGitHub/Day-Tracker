namespace Server;

public class CustomException : Exception
{
    public CustomException(string message)
        : base(message) { }
}

public class UsernameTakenException : CustomException
{
    public UsernameTakenException(string message = "This username has been taken.")
        : base(message) { }
}
