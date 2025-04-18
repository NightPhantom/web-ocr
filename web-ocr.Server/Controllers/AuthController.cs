using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using web_ocr.Server.Data;
using web_ocr.Server.Models;
using web_ocr.Server.Utils;

namespace web_ocr.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthController(ApplicationDbContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            // Find the user by username
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == loginRequest.Username);

            if (user != null && user.Status == UserStatus.Active)
            {
                // Verify the password
                var passwordVerification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginRequest.Password);
                if (passwordVerification == PasswordVerificationResult.Success)
                {
                    // Generate JWT access token
                    var accessToken = GenerateAccessToken(user);

                    // Generate JWT refresh token
                    var refreshToken = GenerateRefreshToken(user);

                    // Update the user's last login time and save refresh token
                    user.LastLogin = DateTime.UtcNow;
                    _context.RefreshTokens.Add(refreshToken);
                    await _context.SaveChangesAsync();

                    // Return the tokens
                    return Ok(new { AccessToken = accessToken, RefreshToken = refreshToken.Token });
                }
            }

            return Unauthorized();
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            // Validate the refresh token
            var refreshToken = await _context.RefreshTokens.SingleOrDefaultAsync(rt => rt.Token == request.RefreshToken);
            if (refreshToken == null || refreshToken.ExpiresAt < DateTime.UtcNow)
            {
                return Unauthorized("Invalid or expired refresh token.");
            }

            // Get the user associated with the refresh token
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == refreshToken.UserId);
            if (user == null || user.Status != UserStatus.Active)
            {
                return Unauthorized("User is not authorized.");
            }

            // Generate new JWT access token
            var newAccessToken = GenerateAccessToken(user);

            // Generate new JWT refresh token
            var newRefreshToken = GenerateRefreshToken(user);
            refreshToken.Token = newRefreshToken.Token;
            refreshToken.ExpiresAt = newRefreshToken.ExpiresAt;
            await _context.SaveChangesAsync();

            // Return the new tokens
            return Ok(new { AccessToken = newAccessToken, RefreshToken = newRefreshToken.Token });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
        {
            // Find the refresh token in the database
            var refreshToken = await _context.RefreshTokens.SingleOrDefaultAsync(rt => rt.Token == request.RefreshToken);
            if (refreshToken == null)
            {
                return NotFound("Refresh token not found.");
            }

            // Revoke the token
            refreshToken.IsRevoked = true;

            // Save changes
            await _context.SaveChangesAsync();

            // Return success response
            return Ok("Logged out successfully.");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistrationRequest registrationRequest)
        {
            // Check if username already exists
            if (await _context.Users.AnyAsync(u => u.Username == registrationRequest.Username))
            {
                return BadRequest("Username already in use.");
            }

            // Hash the invitation code
            var hashedInvitation = HashingHelper.HashWithoutSalt(registrationRequest.InvitationCode);

            // Validate hashed invitation code
            var invitationRecord = await _context.Invitations.SingleOrDefaultAsync(i => i.ValueHash == hashedInvitation && i.UserId == null && i.ExpiresAt > DateTime.UtcNow);

            if (invitationRecord == null)
            {
                return BadRequest("Invalid or expired invitation code.");
            }

            // Create the new user
            var user = new User
            {
                Username = registrationRequest.Username,
                PasswordHash = string.Empty
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, registrationRequest.Password);

            // Save the new user to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Update the invitation record with the new user
            invitationRecord.UserId = user.Id;
            await _context.SaveChangesAsync();

            return Ok();
        }

        private static string GenerateAccessToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("superSecretKeyThatIsLongEnough@34567890");
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Type.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = isDevelopment ? "http://localhost:7063" : "https://web-ocr.andrescosta.com",
                Audience = isDevelopment ? "http://localhost:7063" : "https://web-ocr.andrescosta.com",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            return tokenString;
        }

        private static RefreshToken GenerateRefreshToken(User user)
        {
            return new RefreshToken
            {
                Token = Guid.NewGuid().ToString(),
                UserId = user.Id
            };
        }
    }
}
