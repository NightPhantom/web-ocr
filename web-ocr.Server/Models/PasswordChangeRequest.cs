﻿namespace web_ocr.Server.Models
{
    public class PasswordChangeRequest
    {
        public required string Username { get; set; }
        public required string OldPassword { get; set; }
        public required string NewPassword { get; set; }
    }
}
