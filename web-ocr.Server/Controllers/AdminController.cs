using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using web_ocr.Server.Data;
using web_ocr.Server.Models;
using web_ocr.Server.Utils;

namespace web_ocr.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
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
