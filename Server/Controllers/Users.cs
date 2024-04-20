using Microsoft.AspNetCore.Mvc;
using Server.Database.Models;
using Server.Database.Services;

namespace Server.Controllers;

public class UsersController : CustomBase
{
    [HttpGet(Name = "/")]
    public void Get(UserService service)
    {
        service._context.Charts.Add(
            new()
            {
                Name = "dasdas",
                Type = ChartType.Counter,
                UserId = new Guid("6E380295-271F-47E7-9588-0EBA51F4E18A")
            }
        );
        service._context.SaveChanges();
    }
}
