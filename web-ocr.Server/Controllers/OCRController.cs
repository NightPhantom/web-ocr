using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using web_ocr.Server.Services;

namespace web_ocr.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OCRController : ControllerBase
    {
        private readonly AzureAIService _azureAIService;

        public OCRController(AzureAIService azureAIService)
        {
            _azureAIService = azureAIService;
        }

        [Authorize]
        [HttpPost("process-image")]
        public async Task<IActionResult> ProcessImage(IFormFile image)
        {
            // Validate the image
            if (image == null || image.Length == 0)
            {
                return BadRequest("No image provided.");
            }

            if (!image.ContentType.StartsWith("image/"))
            {
                return BadRequest("Invalid image format.");
            }

            // Read the image into a byte array
            byte[] imageBytes;
            using (var memoryStream = new MemoryStream())
            {
                await image.CopyToAsync(memoryStream);
                imageBytes = memoryStream.ToArray();
            }

            var imageText = await _azureAIService.AnalizeImageAsync(imageBytes);

            return Ok(new { text = imageText });
        }
    }
}
