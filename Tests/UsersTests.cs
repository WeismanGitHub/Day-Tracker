using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Tests
{
    public class UsersTests(CustomWebApplicationFactory<Program> factory)
        : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory = factory;
        private const string Endpoint = "/API/Users/SignUp";

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public async Task SignUp_WithInvalidName_ThrowsValidationException(string name)
        {
            var client = _factory.CreateClient();

            var response = await client.PostAsJsonAsync(
                Endpoint,
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
                Endpoint,
                new { name = Constants.ValidUsername, Password = password }
            );

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task SignUp_WithValidCredentials_Returns201()
        {
            var client = _factory.CreateClient();

            var response = await client.PostAsJsonAsync(
                Endpoint,
                new { name = Constants.ValidUsername, Password = Constants.ValidPassword }
            );

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }
    }
}
