using Microsoft.AspNetCore.Mvc;

namespace Server;

[ApiController]
[Route("Api/[controller]")]
public abstract class CustomBase : ControllerBase { }
