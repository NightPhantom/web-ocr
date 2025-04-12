namespace web_ocr.Server.Models
{
    public class RegistrationRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string InvitationCode { get; set; }
    }
}
