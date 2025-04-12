using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace web_ocr.Server.Models
{
    public class Invitation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(User))]
        public int? UserId { get; set; }

        public User? User { get; set; }

        [Required]
        public required string ValueHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(7);

        public static ValidationResult? ValidateExpiration(DateTime expiresAt, ValidationContext context)
        {
            var instance = (Invitation)context.ObjectInstance;
            return expiresAt > instance.ExpiresAt
                ? ValidationResult.Success
                : new ValidationResult("Expiration date must be after creation date.");
        }
    }
}
