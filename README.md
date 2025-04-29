# Dialogflow API - Flask Integration

![Google Assistant](https://img.shields.io/badge/Google-Assistant-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Dialogflow](https://img.shields.io/badge/Dialogflow-API-FF9800?style=for-the-badge&logo=dialogflow&logoColor=white)

A powerful web-based chatbot implementation that combines Google's Dialogflow capabilities with a Flask backend. This project provides a modern, responsive chat interface with advanced features including voice input, file attachments, and smart conversational responses.

## 📋 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## ✨ Features

- **Modern UI**: Clean, responsive chat interface built with Tailwind CSS
- **Voice Input**: Record and transcribe voice messages
- **File Attachments**: Upload and handle various file types
- **Smart Responses**: Basic natural language processing capabilities
- **Real-time Feedback**: Visual indicators for typing and processing
- **Mobile-Friendly**: Fully responsive design works on all devices
- **Easy Integration**: Simple API for connecting with other applications
- **Customizable**: Easily modify the UI and backend functionality

## 🚀 Demo

You can test the live demo of this project [here](#) (link to be added).

![Demo Screenshot](static/images/demo-screenshot.png)

## 💻 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Yash-Kavaiya/Dialogflow_API-Flask.git
   cd Dialogflow_API-Flask
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   python main.py
   ```

5. Access the application at `http://localhost:8080`

## 🔍 Usage

### Basic Chat

1. Open the application in your browser
2. Click on the chat icon in the bottom-right corner
3. Type your message and press Enter or click the send button

### Voice Input

1. Click the microphone icon in the chat input area
2. Grant microphone permissions if prompted
3. Speak your message
4. Click the send button to transmit your voice message

### File Attachments

1. Click the paperclip icon in the chat input area
2. Select a file from your device (supported formats: images, documents, etc.)
3. The file will be attached to your message
4. Add any additional text and send the message

## 📁 Project Structure

```
Dialogflow_API-Flask/
├── main.py            # Main Flask application file
├── requirements.txt   # Python dependencies
├── static/            # Static assets
│   ├── css/           # CSS stylesheets
│   ├── images/        # Image assets
│   ├── js/            # JavaScript files
│   └── uploads/       # Uploaded files (created at runtime)
└── templates/         # HTML templates
    └── index.html     # Main application template
```

## 📡 API Reference

### Chat Endpoint

```
POST /chat
```

Send a message to the chatbot and receive a response.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "attachment": {
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 58320
  }
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing well. How can I help you with document.pdf?"
}
```

### File Upload Endpoint

```
POST /upload
```

Upload a file to be used in the chat.

**Request:**
- Form data with a `file` field containing the file to upload

**Response:**
```json
{
  "success": true,
  "filename": "uuid_filename.pdf",
  "url": "/static/uploads/uuid_filename.pdf"
}
```

## ⚙️ Configuration

The application can be configured by modifying the following variables in `main.py`:

- `UPLOAD_FOLDER`: Directory for file uploads
- `ALLOWED_EXTENSIONS`: Permitted file extensions
- `MAX_CONTENT_LENGTH`: Maximum file size for uploads

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is available as open source under the terms of the [MIT License](LICENSE).

## 📬 Contact

Yash Kavaiya - [@Yash_Kavaiya_](https://twitter.com/Yash_Kavaiya_)

LinkedIn: [Yash Kavaiya](https://www.linkedin.com/in/yashkavaiya/)

Project Link: [https://github.com/Yash-Kavaiya/Dialogflow_API-Flask](https://github.com/Yash-Kavaiya/Dialogflow_API-Flask)

---

## Support My Work

If you find this project helpful, consider supporting my work:

**UPI Payment:** `9586551131@ybl`

Thank you for checking out my project! 🙏
