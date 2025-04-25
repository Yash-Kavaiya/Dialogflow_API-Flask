from flask import Flask, render_template, request, jsonify, url_for, redirect
import os
import json
import uuid
from datetime import datetime

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    attachment = data.get('attachment', None)
    
    # Process attachment info if provided
    attachment_info = None
    if attachment:
        attachment_info = {
            'name': attachment.get('name', 'unknown'),
            'type': attachment.get('type', 'unknown'),
            'size': attachment.get('size', 0)
        }
    
    # Log the incoming request (for development)
    print(f"Received message: {message}")
    if attachment_info:
        print(f"Attachment: {attachment_info}")
    
    # Simple response logic based on different inputs
    if attachment_info:
        # For attachments
        file_ext = attachment_info['name'].split('.')[-1].lower() if '.' in attachment_info['name'] else 'unknown'
        
        if file_ext in ['jpg', 'jpeg', 'png', 'gif']:
            response = f"I've received your image named {attachment_info['name']}. What would you like me to do with it?"
        elif file_ext in ['pdf', 'doc', 'docx']:
            response = f"I've received your document {attachment_info['name']}. Would you like me to summarize it or extract information from it?"
        else:
            response = f"Thanks for sending {attachment_info['name']}. How can I help you with this file?"
    
    elif 'hello' in message.lower() or 'hi' in message.lower():
        response = "Hello! How can I help you today? Feel free to type a message or use the voice input option."
    
    elif any(term in message.lower() for term in ['help', 'assist', 'support']):
        response = "I can help you with information, troubleshooting, or connecting you with a human agent. What do you need assistance with?"
    
    elif any(term in message.lower() for term in ['bye', 'goodbye', 'exit', 'quit']):
        response = "Goodbye! Have a great day. Feel free to return if you have more questions."
    
    elif 'voice' in message.lower() or 'speech' in message.lower() or 'talk' in message.lower():
        response = "Yes, I support voice input! Click the microphone icon at the bottom of the chat to start speaking. You can then send your recorded message to me."
    
    elif 'attachment' in message.lower() or 'file' in message.lower() or 'upload' in message.lower():
        response = "You can send me files by clicking the paperclip icon. I support various file types including images, documents, and more."
    
    elif 'thanks' in message.lower() or 'thank you' in message.lower():
        response = "You're welcome! I'm happy to help. Is there anything else you need?"
    
    elif len(message) < 3:
        response = "Could you provide more details so I can better assist you?"
    
    else:
        # Default response with a bit more intelligence
        # Check for possible questions
        if message.endswith('?'):
            response = "That's an interesting question. While I have limited knowledge, I'll do my best to help. Can you provide more specific details about what you're looking for?"
        else:
            response = "I understand you're saying something about " + message.split()[0] + ". Can you tell me more about what you need help with?"
    
    # Return the response
    return jsonify({"response": response})

# Route to handle file uploads (for actual file uploads in a real app)
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Create unique filename to prevent collisions
        filename = str(uuid.uuid4()) + '_' + file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'url': url_for('static', filename=f'uploads/{filename}')
        })
    
    return jsonify({'error': 'File type not allowed'}), 400
    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))