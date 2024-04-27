using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Server;

[ApiController]
[Authorize]
[Route("Api/[controller]")]
public abstract class CustomBase : ControllerBase { }
