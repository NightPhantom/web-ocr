
using Azure;
using Azure.AI.Vision.ImageAnalysis;
using Microsoft.IdentityModel.Protocols.Configuration;
using System.Text;

namespace web_ocr.Server.Services
{
    public class AzureAIService
    {
        private ImageAnalysisClient _imageClient;
        private readonly IConfiguration _configuration;

        public AzureAIService(IConfiguration configuration)
        {
            var computerVisionEndpoint = configuration["AzureImageAnalysisService:Endpoint"] ?? throw new InvalidConfigurationException("AzureImageAnalysisService:Endpoint");
            var computerVisionKey = configuration["AzureImageAnalysisService:Key"] ?? throw new InvalidConfigurationException("AzureImageAnalysisService:Key");

            var computerVisionUri = new Uri(computerVisionEndpoint);
            var computerVisionCredentials = new AzureKeyCredential(computerVisionKey);
            _imageClient = new ImageAnalysisClient(computerVisionUri, computerVisionCredentials);

            _configuration = configuration;
        }

        public async Task<string> AnalizeImageAsync(byte[] imageBytes)
        {
            var imageBinaryData = new BinaryData(imageBytes);
            var imageAnalysisResult = await _imageClient.AnalyzeAsync(imageBinaryData, VisualFeatures.Read);

            return GetAnalysisResultString(imageAnalysisResult.Value, _configuration.GetSection("OCRSettings"));
        }

        private static string GetAnalysisResultString(ImageAnalysisResult result, IConfigurationSection ocrSettings)
        {
            StringBuilder sb = new StringBuilder();

            if (result.Read != null)
            {
                if (result.Read.Blocks.Count == 0)
                {
                    return "No text detected";
                }

                foreach (var block in result.Read.Blocks)
                {
                    foreach (var line in block.Lines)
                    {
                        if (line.Words.All(word => word.Confidence >= ocrSettings.GetValue<float>("WordConfidenceThreshold", 0.5f)))
                        {
                            sb.AppendLine(line.Text);
                        }
                    }
                }
            }

            return sb.ToString();
        }
    }
}
