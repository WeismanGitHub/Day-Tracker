using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Tests
{
    public class UsersTests(WebApplicationFactory<Program> factory)
        : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory = factory;

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public async Task SignUp_WithInvalidName_ThrowsValidationException(string name)
        {
            var client = _factory.CreateClient();

            var response = await client.PostAsJsonAsync(
                "/API/Users/SignUp",
                new { name, Password = Constants.ValidPassword }
            );

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
