namespace Server;

public class JwtConfig
{
    public required string Secret { get; set; }
    public required string ValidIssuer { get; set; }
    public required string ValidAudience { get; set; }
}

public class Configuration
{
    public required JwtConfig Jwt { get; set; }
}
