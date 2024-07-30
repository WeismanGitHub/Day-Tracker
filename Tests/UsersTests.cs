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

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        [InlineData("invalidpassword1")] // Missing uppercase character
        [InlineData("INVALIDPASSWORD1")] // Missing lowercase character
        [InlineData("InvalidPassword")] // Missing number character
        public async Task SignUp_WithInvalidPassword_ThrowsValidationException(string password)
        {
            var client = _factory.CreateClient();

            var response = await client.PostAsJsonAsync(
                "/API/Users/SignUp",
                new { name = Constants.ValidUsername, Password = password }
            );

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
