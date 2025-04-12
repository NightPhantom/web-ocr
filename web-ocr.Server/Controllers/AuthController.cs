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
        public async Task<IActionResult> Login([FromBody] Login login)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == login.Username);

            if (user != null)
            {
                var passwordVerification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, login.Password);
                if (passwordVerification == PasswordVerificationResult.Success)
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var key = Encoding.ASCII.GetBytes("superSecretKeyThatIsLongEnough@34567890");
                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new Claim[]
                        {
                            new Claim(ClaimTypes.Name, login.Username),
                            new Claim(ClaimTypes.Role, user.Type.ToString())
                        }),
                        Expires = DateTime.UtcNow.AddHours(1),
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                    };
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    var tokenString = tokenHandler.WriteToken(token);

                    user.LastLogin = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    return Ok(new { Token = tokenString });
                }
            }

            return Unauthorized();
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

        [Authorize(Policy = "AdminOnly")]
        [HttpPost("generate-invitation")]
        public async Task<IActionResult> GenerateInvitation(int validDays = 7)
        {
            // Confirm that user is admin
            var username = User.Identity?.Name;
            if (username == null)
            {
                return Unauthorized("User is not authenticated.");
            }
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
            if (user == null || user.Type != UserType.Admin)
            {
                return Forbid("Only admin users can generate invitations.");
            }

            // Generate a new invitation code
            var invitationCode = Guid.NewGuid().ToString("N");

            // Hash the invitation code
            var hashedInvitation = HashingHelper.HashWithoutSalt(invitationCode);

            // Create a new invitation record
            var invitation = new Invitation
            {
                ValueHash = hashedInvitation,
                ExpiresAt = DateTime.UtcNow.AddDays(validDays)
            };

            // Save the invitation to the database
            _context.Invitations.Add(invitation);
            await _context.SaveChangesAsync();

            // Return the invitation code
            return Ok(new { InvitationCode = invitationCode });
        }
    }
}
