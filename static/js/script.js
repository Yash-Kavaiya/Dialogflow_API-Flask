document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Chat UI
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChat = document.getElementById('close-chat');
    const minimizeChat = document.getElementById('minimize-chat');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatContainer = document.getElementById('chat-container');
    
    // DOM Elements - Voice UI
    const voiceButton = document.getElementById('voice-button');
    const voicePopup = document.getElementById('voice-popup');
    const voicePopupOverlay = document.getElementById('voice-popup-overlay');
    const closeVoicePopup = document.getElementById('close-voice-popup');
    const startRecording = document.getElementById('start-recording');
    const pauseRecording = document.getElementById('pause-recording');
    const resumeRecording = document.getElementById('resume-recording');
    const resetRecording = document.getElementById('reset-recording');
    const sendVoice = document.getElementById('send-voice');
    const transcriptionResult = document.getElementById('transcription-result');
    const recordingIndicator = document.getElementById('recording-indicator');
    const waveformPath = document.getElementById('waveform-svg-path');
    const recordingStatus = document.getElementById('recording-status');
    
    // DOM Elements - Attachment UI
    const attachmentButton = document.getElementById('attachment-button');
    const fileInput = document.getElementById('file-input');
    const attachmentPreview = document.getElementById('attachment-preview');
    const attachmentName = document.getElementById('attachment-name');
    const removeAttachment = document.getElementById('remove-attachment');
    
    // Speech Recognition Setup
    let recognition = null;
    let isRecording = false;
    let isPaused = false;
    let recognitionTimeout = null;
    let currentFile = null;
    
    // Initialize Speech Recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Default language
        
        recognition.onresult = function(event) {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            // Display transcription with highlighting
            transcriptionResult.innerHTML = `
                <span class="text-gray-800 font-medium">${finalTranscript}</span>
                <span class="text-gray-500 italic">${interimTranscript}</span>
            `;
            
            // Enable send button if we have text
            if (finalTranscript.trim() !== '' || interimTranscript.trim() !== '') {
                sendVoice.disabled = false;
                sendVoice.classList.add('animate-pulse');
                // Update status text
                recordingStatus.innerHTML = 'Speech detected! <span class="text-google-green">✓</span>';
            } else {
                sendVoice.disabled = true;
                sendVoice.classList.remove('animate-pulse');
            }
        };
        
        recognition.onend = function() {
            if (isRecording && !isPaused) {
                // If it stopped on its own but we're still recording, restart it
                recognition.start();
            } else {
                isRecording = false;
                recordingIndicator.classList.add('hidden');
                startRecording.querySelector('i').className = 'fas fa-microphone';
                updateVoiceControls();
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            isRecording = false;
            recordingIndicator.classList.add('hidden');
            startRecording.querySelector('i').className = 'fas fa-microphone';
            updateVoiceControls();
            
            // Show error in transcription area
            transcriptionResult.innerHTML = `<span class="text-red-500">Error: ${event.error}. Please try again.</span>`;
        };
    }
    
    // Toggle chat window visibility
    chatbotIcon.addEventListener('click', function() {
        chatbotWindow.classList.remove('hidden');
        chatbotIcon.classList.add('hidden');
        chatInput.focus();
        scrollToBottom();
    });
    
    // Close chat window
    closeChat.addEventListener('click', function() {
        chatbotWindow.classList.add('hidden');
        chatbotIcon.classList.remove('hidden');
        // Also close voice popup if open
        voicePopup.classList.add('hidden');
        voicePopupOverlay.classList.add('hidden');
    });
    
    // Minimize chat window
    minimizeChat.addEventListener('click', function() {
        chatbotWindow.classList.add('hidden');
        chatbotIcon.classList.remove('hidden');
        // Also close voice popup if open
        voicePopup.classList.add('hidden');
        voicePopupOverlay.classList.add('hidden');
    });
    
    // Open voice popup
    voiceButton.addEventListener('click', function() {
        voicePopup.classList.remove('hidden');
        voicePopupOverlay.classList.remove('hidden');
        chatInput.blur(); // Remove focus from text input
        
        // Reset the voice UI when opening
        resetVoiceUI();
        
        // Add recording status if it doesn't exist
        if (!document.getElementById('recording-status')) {
            const statusElement = document.createElement('div');
            statusElement.id = 'recording-status';
            statusElement.classList.add('text-center', 'text-sm', 'text-gray-600', 'mt-2');
            statusElement.textContent = 'Click the microphone to start recording';
            voicePopup.appendChild(statusElement);
        } else {
            document.getElementById('recording-status').textContent = 'Click the microphone to start recording';
        }
        
        // Focus on start recording button for better accessibility
        setTimeout(() => {
            startRecording.focus();
        }, 100);
    });
    
    // Close voice popup by clicking the close button
    closeVoicePopup.addEventListener('click', function() {
        closeVoicePopupFunc();
    });
    
    // Close voice popup by clicking the overlay
    voicePopupOverlay.addEventListener('click', function() {
        closeVoicePopupFunc();
    });
    
    // Close voice popup with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !voicePopup.classList.contains('hidden')) {
            closeVoicePopupFunc();
        }
    });
    
    // Function to close voice popup and handle cleanup
    function closeVoicePopupFunc() {
        voicePopup.classList.add('hidden');
        voicePopupOverlay.classList.add('hidden');
        stopRecording();
        // Return focus to chat input
        setTimeout(() => {
            chatInput.focus();
        }, 100);
    }
    
    // Handle file attachment
    attachmentButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            currentFile = e.target.files[0];
            attachmentName.textContent = currentFile.name;
            attachmentPreview.classList.remove('hidden');
        }
    });
    
    // Remove attachment
    removeAttachment.addEventListener('click', function() {
        currentFile = null;
        fileInput.value = '';
        attachmentPreview.classList.add('hidden');
    });
    
    // Voice Recording Controls
    startRecording.addEventListener('click', function() {
        if (!isRecording) {
            // Start recording
            if (recognition) {
                try {
                    recognition.start();
                    isRecording = true;
                    isPaused = false;
                    recordingIndicator.classList.remove('hidden');
                    startRecording.querySelector('i').className = 'fas fa-stop';
                    transcriptionResult.innerHTML = '';
                    sendVoice.disabled = true;
                    sendVoice.classList.remove('animate-pulse');
                    
                    // Update recording status
                    if (recordingStatus) {
                        recordingStatus.innerHTML = '<span class="text-google-red animate-pulse">●</span> Recording... speak now';
                    }
                    
                    animateWaveform(true);
                    updateVoiceControls();
                } catch (e) {
                    console.error('Error starting recognition', e);
                    if (recordingStatus) {
                        recordingStatus.innerHTML = '<span class="text-red-500">Error starting speech recognition. Please try again.</span>';
                        setTimeout(() => {
                            recordingStatus.textContent = 'Click the microphone to start recording';
                        }, 3000);
                    }
                }
            } else {
                if (recordingStatus) {
                    recordingStatus.innerHTML = '<span class="text-red-500">Speech recognition is not supported in your browser.</span>';
                }
            }
        } else {
            // Stop recording
            stopRecording();
        }
    });
    
    pauseRecording.addEventListener('click', function() {
        if (isRecording && !isPaused && recognition) {
            recognition.stop();
            isPaused = true;
            animateWaveform(false);
            updateVoiceControls();
            // Update status
            if (recordingStatus) {
                recordingStatus.innerHTML = '<span class="text-yellow-500">⏸</span> Recording paused';
            }
        }
    });
    
    resumeRecording.addEventListener('click', function() {
        if (isRecording && isPaused && recognition) {
            try {
                recognition.start();
                isPaused = false;
                animateWaveform(true);
                updateVoiceControls();
                // Update status
                if (recordingStatus) {
                    recordingStatus.innerHTML = '<span class="text-google-red animate-pulse">●</span> Recording resumed... speak now';
                }
            } catch (e) {
                console.error('Error resuming recognition', e);
                if (recordingStatus) {
                    recordingStatus.innerHTML = '<span class="text-red-500">Error resuming recording. Please try again.</span>';
                }
            }
        }
    });
    
    resetRecording.addEventListener('click', function() {
        resetVoiceUI();
        // Play a subtle reset sound effect (optional)
        // const audio = new Audio('/static/sounds/reset.mp3');
        // audio.volume = 0.3;
        // audio.play().catch(e => console.log('Audio play prevented: ', e));
    });
    
    sendVoice.addEventListener('click', function() {
        const text = transcriptionResult.textContent.trim();
        if (text) {
            // Show sending feedback
            sendVoice.disabled = true;
            sendVoice.classList.remove('animate-pulse');
            if (recordingStatus) {
                recordingStatus.innerHTML = '<span class="text-google-green animate-pulse">↑</span> Sending message...';
            }
            
            // Briefly show sending animation before closing
            setTimeout(() => {
                // Add user message to chat
                addMessage('user', text, 'voice');
                
                // Clear input and close popup
                transcriptionResult.innerHTML = '';
                voicePopup.classList.add('hidden');
                voicePopupOverlay.classList.add('hidden');
                stopRecording();
                resetVoiceUI();
                
                // Process the message with voice input flag
                processMessage(text, null, true);
                
                // Return focus to chat input
                chatInput.focus();
            }, 800);
        }
    });
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Function to send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '' && !currentFile) return;
        
        // Add user message to chat
        if (message) {
            addMessage('user', message, currentFile ? 'text-with-attachment' : 'text');
        } else if (currentFile) {
            addMessage('user', currentFile.name, 'attachment');
        }
        
        // Clear input
        chatInput.value = '';
        
        // Handle the file if any
        let fileData = null;
        if (currentFile) {
            fileData = {
                name: currentFile.name,
                type: currentFile.type,
                size: currentFile.size
            };
            
            // Clear the attachment UI
            currentFile = null;
            fileInput.value = '';
            attachmentPreview.classList.add('hidden');
        }
        
        // Process the message
        processMessage(message, fileData);
    }
    
    // Process the message and get a response
    function processMessage(message, fileData = null, isVoiceInput = false) {
        // Show typing indicator
        showTypingIndicator();
        
        // Prepare the data to send
        const data = {
            message: message || ''
        };
        
        if (fileData) {
            data.attachment = fileData;
        }
        
        // Send to server and get response
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add bot response to chat
            setTimeout(() => {
                addMessage('bot', data.response, 'text');
                
                // If input was voice, use speech synthesis for response
                if (isVoiceInput && 'speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(data.response);
                    utterance.lang = 'en-US';
                    utterance.rate = 1.0;
                    utterance.pitch = 1.0;
                    window.speechSynthesis.speak(utterance);
                }
            }, 500);
        })
        .catch(error => {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage('bot', 'Sorry, there was an error processing your request.', 'text');
        });
    }
    
    // Function to add message to chat
    function addMessage(sender, message, type = 'text') {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex mb-4';
        
        if (sender === 'user') {
            let messageContent = '';
            
            // Create different content based on the message type
            if (type === 'attachment') {
                messageContent = `
                    <div class="bg-blue-100 rounded-lg py-2 px-3 shadow-sm max-w-[80%]">
                        <div class="flex items-center">
                            <i class="fas fa-file-alt text-google-blue mr-2"></i>
                            <p class="text-sm">${escapeHtml(message)}</p>
                        </div>
                    </div>
                `;
            } else if (type === 'voice') {
                messageContent = `
                    <div class="bg-blue-100 rounded-lg py-2 px-3 shadow-sm max-w-[80%]">
                        <div class="flex items-start">
                            <i class="fas fa-microphone text-google-red mt-1 mr-2"></i>
                            <p class="text-sm">${escapeHtml(message)}</p>
                        </div>
                    </div>
                `;
            } else if (type === 'text-with-attachment') {
                messageContent = `
                    <div class="bg-blue-100 rounded-lg py-2 px-3 shadow-sm max-w-[80%]">
                        <p class="text-sm mb-2">${escapeHtml(message)}</p>
                        <div class="flex items-center text-xs text-gray-600">
                            <i class="fas fa-paperclip mr-1"></i>
                            <span>Attachment included</span>
                        </div>
                    </div>
                `;
            } else {
                messageContent = `
                    <div class="bg-blue-100 rounded-lg py-2 px-3 shadow-sm max-w-[80%]">
                        <p class="text-sm">${escapeHtml(message)}</p>
                    </div>
                `;
            }
            
            messageDiv.innerHTML = `
                <div class="flex-grow"></div>
                ${messageContent}
                <div class="w-8 h-8 rounded-full bg-white border-2 border-google-blue flex items-center justify-center ml-2 flex-shrink-0">
                    <i class="fas fa-user text-google-blue text-sm"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-white border-2 border-google-blue flex items-center justify-center mr-2 flex-shrink-0">
                    <i class="fas fa-robot text-google-blue text-sm"></i>
                </div>
                <div class="bg-white rounded-lg py-2 px-3 shadow-sm max-w-[80%]">
                    <p class="text-sm">${escapeHtml(message)}</p>
                </div>
            `;
        }
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'flex mb-4 typing-indicator-container';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-white border-2 border-google-blue flex items-center justify-center mr-2 flex-shrink-0">
                <i class="fas fa-robot text-google-blue text-sm"></i>
            </div>
            <div class="bg-white rounded-lg py-2 px-3 shadow-sm">
                <p class="text-sm typing-indicator">Typing</p>
            </div>
        `;
        chatContainer.appendChild(typingDiv);
        scrollToBottom();
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator-container');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Scroll to bottom of chat container
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Update voice control buttons based on current state
    function updateVoiceControls() {
        if (isRecording) {
            pauseRecording.disabled = isPaused;
            resumeRecording.disabled = !isPaused;
            resetRecording.disabled = false;
        } else {
            pauseRecording.disabled = true;
            resumeRecording.disabled = true;
            resetRecording.disabled = true;
            sendVoice.disabled = transcriptionResult.textContent.trim() === '';
        }
    }
    
    // Stop recording
    function stopRecording() {
        if (recognition && isRecording) {
            recognition.stop();
            isRecording = false;
            isPaused = false;
            recordingIndicator.classList.add('hidden');
            startRecording.querySelector('i').className = 'fas fa-microphone';
            animateWaveform(false);
            
            // Update status based on whether we have transcription
            if (recordingStatus) {
                if (transcriptionResult.textContent.trim() !== '') {
                    recordingStatus.innerHTML = '<span class="text-google-blue">✓</span> Recording complete. You can send or reset.';
                } else {
                    recordingStatus.textContent = 'Recording stopped. Click microphone to try again.';
                }
            }
            
            updateVoiceControls();
        }
    }
    
    // Reset voice UI
    function resetVoiceUI() {
        stopRecording();
        transcriptionResult.innerHTML = '';
        sendVoice.disabled = true;
        sendVoice.classList.remove('animate-pulse');
        pauseRecording.disabled = true;
        resumeRecording.disabled = true;
        resetRecording.disabled = true;
        startRecording.querySelector('i').className = 'fas fa-microphone';
        
        // Reset the status message
        if (recordingStatus) {
            recordingStatus.textContent = 'Click the microphone to start recording';
        }
        
        // Reset waveform
        waveformPath.setAttribute('d', 'M0,30 Q25,30 50,30 T100,30 T150,30 T200,30 T250,30 T300,30');
    }
    
    // Animate the waveform with improved visualization
    function animateWaveform(active) {
        if (active) {
            // Audio visualization simulation
            let lastValues = Array(20).fill(30); // Start with flat line
            
            function updateWaveform() {
                if (!isRecording || isPaused) return;
                
                const points = [];
                const totalPoints = 20;
                
                // Create a more natural-looking waveform that responds to "speech"
                for (let i = 0; i <= totalPoints; i++) {
                    const x = (i / totalPoints) * 300;
                    
                    // Edge points stay at baseline
                    if (i === 0 || i === totalPoints) {
                        points.push([x, 30]);
                        continue;
                    }
                    
                    // For inner points, create more natural movement
                    // Use the previous value as a starting point for smoother transitions
                    let prevVal = lastValues[i];
                    
                    // Add randomness but with some inertia from previous frame
                    let amplitude = Math.random() * 18 + 2; // Smaller than before for less jumpiness
                    
                    // Simulate "loud" bursts occasionally
                    if (Math.random() < 0.05) {
                        amplitude += 15;
                    }
                    
                    // Move somewhat toward the random target, but not all the way (smoother)
                    let targetY = 30 - amplitude + Math.random() * (amplitude/3);
                    let y = prevVal + (targetY - prevVal) * 0.3;
                    
                    // Store for next frame
                    lastValues[i] = y;
                    
                    points.push([x, y]);
                }
                
                // Convert points to SVG path with smoother curves
                let pathData = `M${points[0][0]},${points[0][1]}`;
                
                // Use cubic Bezier curves for smoother transitions
                for (let i = 1; i < points.length; i++) {
                    const [x, y] = points[i];
                    const [prevX, prevY] = points[i-1];
                    
                    // Control points for the cubic curve
                    const cp1x = prevX + (x - prevX) * 0.4;
                    const cp1y = prevY;
                    const cp2x = prevX + (x - prevX) * 0.6;
                    const cp2y = y;
                    
                    pathData += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
                }
                
                // Apply the new path
                waveformPath.setAttribute('d', pathData);
                
                // Continue animation if still recording
                if (isRecording && !isPaused) {
                    requestAnimationFrame(updateWaveform);
                }
            }
            
            // Start the animation
            requestAnimationFrame(updateWaveform);
        } else {
            // Smoothly animate back to flat line when inactive
            const currentPath = waveformPath.getAttribute('d');
            const flatPath = 'M0,30 Q25,30 50,30 T100,30 T150,30 T200,30 T250,30 T300,30';
            
            // Simple transition using CSS
            waveformPath.style.transition = 'd 0.5s ease-out';
            waveformPath.setAttribute('d', flatPath);
            
            // Reset transition after it completes
            setTimeout(() => {
                waveformPath.style.transition = '';
            }, 500);
        }
    }
});
