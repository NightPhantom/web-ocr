using Microsoft.EntityFrameworkCore;
using web_ocr.Server.Models;

namespace web_ocr.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) :base(options)
        {
        }
    }
}
