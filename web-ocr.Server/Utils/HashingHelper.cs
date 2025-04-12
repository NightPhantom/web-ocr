using System.Security.Cryptography;
using System.Text;
using web_ocr.Server.Models;

namespace web_ocr.Server.Utils
{
    public static class HashingHelper
    {
        public static string GenerateRandomSalt(int length = 16)
        {
            var saltBytes = new byte[length];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(saltBytes);
            }
            return Convert.ToBase64String(saltBytes);
        }

        public static (string Hash, string Salt) HashWithSalt(string value)
        {
            var salt = GenerateRandomSalt();

            // Combine the value and salt
            var valueWithSalt = value + salt;

            // Hash the combined value
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(valueWithSalt));
            var hash = Convert.ToBase64String(hashBytes);

            return (Hash: hash, Salt: salt);
        }

        public static string HashWithExistingSalt(string value, string salt)
        {
            // Combine the value and the existing salt
            var valueWithSalt = value + salt;

            // Hash the combined value
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(valueWithSalt));
            return Convert.ToBase64String(hashBytes);
        }

        public static string HashWithoutSalt(string value)
        {
            using var sha256 = SHA256.Create();
            return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(value)));
        }

        public static bool VerifyHash(string value, string salt, string hash)
        {
            // Hash the value with the existing salt
            var computedHash = HashWithExistingSalt(value, salt);
            return computedHash == hash;
        }

        public static bool VerifyHash(string value, string hash)
        {
            // Hash the value without salt
            var computedHash = HashWithoutSalt(value);
            return computedHash == hash;
        }
    }
}
