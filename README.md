# Web OCR

A modern web application that extracts text from images using Azure AI Vision services. This full-stack application features a .NET 8 backend with an Angular frontend, secure user authentication, and integration with Azure's OCR capabilities.

## Live Demo

Try the application without installation: [https://web-ocr.andrescosta.com](https://web-ocr.andrescosta.com)

## Features
- Image Text Extraction: Upload images and extract visible text using Azure AI Vision services
- User Authentication: Secure JWT-based authentication system with refresh tokens
- User Management: Registration system with invitation codes
- Responsive UI: Clean, modern interface built with Angular Material
- Secure API: RESTful endpoints with proper authentication and authorization

## Technology Stack

### Backend
- .NET 8: Latest framework for building the server-side API
- Entity Framework Core: ORM for database operations
- MySQL: Database for storing user information and application data
- Azure AI Vision: For image analysis and optical character recognition
- JWT Authentication: For secure user authentication

### Frontend
- Angular: Modern framework for building the user interface
- Angular Material: UI component library for a consistent design
- RxJS: For reactive programming patterns

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js and npm
- MySQL Server
- Azure subscription (for AI Vision services)
### Installation
1. Clone the repository

	```shell
	git clone https://github.com/yourusername/web-ocr.git
	cd web-ocr
	```

1. Configure the backend
	Locate the appsettings.json file in the web-ocr.Server directory, and substitute `ConnectionStrings`, `JwtSettings`, and `AzureImageAnalysisService` with your own values.

    ```json
    {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     "ConnectionStrings": {
       "DefaultConnection": "server=localhost;database=web_ocr;user=root;password=your_password"
     },
     "JwtSettings": {
       "ValidIssuer": "your_issuer",
       "ValidAudience": "your_audience",
       "IssuerSigningKey": "your_secure_key_at_least_32_bytes_long"
     },
     "AzureImageAnalysisService": {
       "Endpoint": "https://your-azure-vision-endpoint.cognitiveservices.azure.com/",
       "Key": "your_azure_vision_api_key"
     },
     "OCRSettings": {
       "WordConfidenceThreshold": 0.5
     },
     "CorsOrigins": [
       "https://localhost:51241"
     ]
   }   
	```

1. Set up the database

    ```shell
    cd web-ocr.Server
    dotnet ef database update
    ```

1. Install the frontend dependencies

    ```shell
    cd ../web-ocr.client
    npm install
    ```

1. Run the application

    ```shell
    cd ../web-ocr.Server
    dotnet run
    ```

## Usage

- Register a new account with an invitation code
- Log in to access the dashboard
- Upload an image containing text you want to extract
- Click "Analyze" to process the image
- View the extracted text and copy it to your clipboard as needed

## Security Features

- JWT token-based authentication
- Password hashing
- Invitation-only registration
- Role-based authorization
- HTTPS enforcement

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Acknowledgments
 - [Azure AI Vision](https://azure.microsoft.com/en-us/products/ai-services/ai-vision/) for OCR capabilities
 - [Angular Material](https://material.angular.io/) for UI components

## Support the Project

If you find this project helpful, consider buying me a coffee!

<a href="https://www.buymeacoffee.com/AndyCosta" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;"></a>
