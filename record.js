// Record & Analyze Page Functionality
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingTimer = null;
let recordingStartTime = 0;
let audioContext = null;
let analyser = null;
let waveformAnimationId = null;

// Reading prompts pool
const readingPrompts = [
    "The air is fresh and clean today, and I feel calm and relaxed while taking deep breaths.",
    "Reading books in the peaceful garden helps me breathe more easily and deeply.",
    "Walking slowly through the forest allows me to appreciate the clean, crisp mountain air.",
    "The gentle morning breeze carries the sweet scent of blooming flowers across the meadow.",
    "Sitting quietly by the lake, I can hear my breathing sync with the gentle waves.",
    "The warm sunshine on my face makes me want to take long, satisfying breaths.",
    "During meditation, I focus on the rhythm of my breathing and feel completely at peace.",
    "The cool evening air fills my lungs as I watch the beautiful sunset paint the sky.",
    "Yoga practice helps me coordinate my breathing with gentle, flowing movements.",
    "The sound of rain on the roof creates a perfect atmosphere for deep, restful breathing."
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadRandomPrompt();
    setupAudioUpload();
});

// Initialize the page
function initializePage() {
    // Check if user is logged in
    const userEmail = localStorage.getItem('breathemate_email');
    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize audio context for waveform
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported');
    }
}

// Load random reading prompt
function loadRandomPrompt() {
    const randomIndex = Math.floor(Math.random() * readingPrompts.length);
    const promptText = document.getElementById('promptText');
    promptText.textContent = readingPrompts[randomIndex];
    
    // Add fade in animation
    promptText.style.opacity = '0';
    setTimeout(() => {
        promptText.style.transition = 'opacity 0.5s ease';
        promptText.style.opacity = '1';
    }, 100);
}

// Start recording function
async function startRecording() {
    try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });
        
        // Set up MediaRecorder
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
        });
        
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            processAudioRecording(audioBlob);
        };
        
        // Start recording
        mediaRecorder.start(100); // Collect data every 100ms
        isRecording = true;
        
        // Update UI
        updateRecordingUI(true);
        startTimer();
        setupWaveformVisualization(stream);
        
        showMessage('Recording started! Please read the prompt clearly.', 'success');
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        showMessage('Unable to access microphone. Please check permissions.', 'error');
    }
}

// Stop recording function
function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Stop all tracks
        if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        // Update UI
        updateRecordingUI(false);
        stopTimer();
        stopWaveformVisualization();
        
        showMessage('Recording stopped. Processing audio...', 'info');
    }
}

// Update recording UI
function updateRecordingUI(recording) {
    const micAnimation = document.getElementById('micAnimation');
    const recordingStatus = document.getElementById('recordingStatus');
    const recordingSubtext = document.getElementById('recordingSubtext');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const timerSection = document.getElementById('timerSection');
    const waveformContainer = document.getElementById('waveformContainer');
    
    if (recording) {
        micAnimation.classList.add('recording');
        recordingStatus.textContent = 'Recording in progress...';
        recordingSubtext.textContent = 'Please read the prompt clearly and naturally';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        uploadBtn.disabled = true;
        timerSection.classList.add('active');
        waveformContainer.classList.add('active');
    } else {
        micAnimation.classList.remove('recording');
        recordingStatus.textContent = 'Recording complete';
        recordingSubtext.textContent = 'Processing your audio...';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        uploadBtn.disabled = false;
        timerSection.classList.remove('active');
        waveformContainer.classList.remove('active');
    }
}

// Timer functions
function startTimer() {
    recordingStartTime = Date.now();
    recordingTimer = setInterval(updateTimer, 100);
}

function stopTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
}

function updateTimer() {
    const elapsed = Date.now() - recordingStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.textContent = 
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Waveform visualization
function setupWaveformVisualization(stream) {
    if (!audioContext) return;
    
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    
    function drawWaveform() {
        if (!isRecording) return;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
            
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
        
        waveformAnimationId = requestAnimationFrame(drawWaveform);
    }
    
    drawWaveform();
}

function stopWaveformVisualization() {
    if (waveformAnimationId) {
        cancelAnimationFrame(waveformAnimationId);
        waveformAnimationId = null;
    }
    
    // Clear canvas
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Audio upload functionality
function setupAudioUpload() {
    const fileInput = document.getElementById('audioFileInput');
    fileInput.addEventListener('change', handleAudioUpload);
}

function uploadAudio() {
    document.getElementById('audioFileInput').click();
}

function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a'];
        if (!validTypes.includes(file.type)) {
            showMessage('Please upload a valid audio file (.wav, .mp3, .m4a)', 'error');
            return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showMessage('File size must be less than 10MB', 'error');
            return;
        }
        
        showMessage(`Uploaded: ${file.name}. Processing audio...`, 'success');
        processAudioRecording(file);
    }
}

// Process audio recording
function processAudioRecording(audioData) {
    // Hide recording section
    document.getElementById('recordingSection').style.display = 'none';
    
    // Show loading section
    document.getElementById('analysisLoading').style.display = 'block';
    
    // Simulate analysis progress
    simulateAnalysisProgress();
}

// Simulate analysis progress
function simulateAnalysisProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    let progress = 0;
    
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress between 5-20%
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            setTimeout(() => {
                showAnalysisResults();
            }, 500);
        }
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }, 300);
}

// Show analysis results
function showAnalysisResults() {
    // Hide loading section
    document.getElementById('analysisLoading').style.display = 'none';
    
    // Generate random but realistic analysis results
    const analysisData = generateAnalysisResults();
    
    // Update UI with results
    updateAnalysisResults(analysisData);
    
    // Show results section
    document.getElementById('analysisResults').style.display = 'block';
    
    // Scroll to results
    document.getElementById('analysisResults').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Generate realistic analysis results
function generateAnalysisResults() {
    const conditions = [
        { name: 'Normal Breathing Pattern', risk: 15, stage: 'low' },
        { name: 'Possible Asthma Indicators', risk: 67, stage: 'medium' },
        { name: 'COPD Indicators Detected', risk: 82, stage: 'high' },
        { name: 'Mild Breathing Irregularities', risk: 34, stage: 'low' },
        { name: 'Wheezing Patterns Detected', risk: 78, stage: 'high' },
        { name: 'Stress-Related Breathing', risk: 45, stage: 'medium' }
    ];
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
        riskPercentage: randomCondition.risk,
        detectedCondition: randomCondition.name,
        riskStage: randomCondition.stage,
        breathInterruptions: Math.floor(Math.random() * 8) + 1,
        avgPauseDuration: (Math.random() * 3 + 0.5).toFixed(1),
        voiceIrregularities: Math.random() > 0.5 ? 'Yes' : 'No',
        breathingRate: Math.floor(Math.random() * 10) + 12
    };
}

// Update analysis results in UI
function updateAnalysisResults(data) {
    // Update risk circle
    const riskCircle = document.getElementById('riskCircle');
    const riskValue = document.getElementById('riskValue');
    const riskStage = document.getElementById('riskStage');
    const detectedCondition = document.getElementById('detectedCondition');
    
    // Calculate circle progress (360 degrees = 100%)
    const degrees = (data.riskPercentage / 100) * 360;
    
    // Update risk circle color based on risk level
    let riskColor = '#38a169'; // Green for low
    if (data.riskStage === 'medium') riskColor = '#d69e2e'; // Yellow
    if (data.riskStage === 'high') riskColor = '#e53e3e'; // Red
    
    riskCircle.style.background = `conic-gradient(${riskColor} 0deg ${degrees}deg, #e2e8f0 ${degrees}deg 360deg)`;
    riskValue.textContent = `${data.riskPercentage}%`;
    detectedCondition.textContent = data.detectedCondition;
    
    // Update risk stage badge
    riskStage.textContent = data.riskStage.charAt(0).toUpperCase() + data.riskStage.slice(1);
    riskStage.className = `risk-badge ${data.riskStage}`;
    
    // Update breakdown values
    document.getElementById('breathInterruptions').textContent = data.breathInterruptions;
    document.getElementById('avgPauseDuration').textContent = `${data.avgPauseDuration}s`;
    document.getElementById('voiceIrregularities').textContent = data.voiceIrregularities;
    document.getElementById('breathingRate').textContent = `${data.breathingRate}/min`;
}

// Action button functions
function tryAgain() {
    // Reset to recording section
    document.getElementById('analysisResults').style.display = 'none';
    document.getElementById('analysisLoading').style.display = 'none';
    document.getElementById('recordingSection').style.display = 'block';
    
    // Reset recording UI
    updateRecordingUI(false);
    
    // Load new prompt
    loadRandomPrompt();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showMessage('Ready for a new recording!', 'info');
}

function saveToJournal() {
    // Save results to localStorage (simulate saving to journal)
    const currentDate = new Date().toISOString();
    const journalEntry = {
        date: currentDate,
        type: 'breath_analysis',
        riskLevel: document.getElementById('riskValue').textContent,
        condition: document.getElementById('detectedCondition').textContent,
        stage: document.getElementById('riskStage').textContent
    };
    
    // Get existing journal entries
    const existingEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    existingEntries.unshift(journalEntry);
    
    // Keep only last 50 entries
    if (existingEntries.length > 50) {
        existingEntries.splice(50);
    }
    
    localStorage.setItem('breathemate_journal', JSON.stringify(existingEntries));
    
    showMessage('Analysis results saved to your breathing journal!', 'success');
}

function shareReport() {
    // Simulate sharing functionality
    const reportData = {
        date: new Date().toLocaleDateString(),
        risk: document.getElementById('riskValue').textContent,
        condition: document.getElementById('detectedCondition').textContent
    };
    
    const shareText = `BreatheMate Analysis Report\nDate: ${reportData.date}\nRisk Level: ${reportData.risk}\nCondition: ${reportData.condition}\n\nAnalyzed with BreatheMate - Your Lung Health Monitor`;
    
    if (navigator.share) {
        navigator.share({
            title: 'BreatheMate Analysis Report',
            text: shareText
        }).then(() => {
            showMessage('Report shared successfully!', 'success');
        }).catch(() => {
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    // Fallback sharing method
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('Report copied to clipboard!', 'success');
        });
    } else {
        // Create temporary textarea for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showMessage('Report copied to clipboard!', 'success');
    }
}

function goBackToDashboard() {
    // Update dashboard with new scan data if analysis was completed
    if (document.getElementById('analysisResults').style.display === 'block') {
        const currentDate = new Date().toISOString();
        const riskLevel = document.getElementById('detectedCondition').textContent;
        
        localStorage.setItem('breathemate_last_scan', currentDate);
        localStorage.setItem('breathemate_risk_level', riskLevel);
        
        const currentStreak = parseInt(localStorage.getItem('breathemate_daily_streak')) || 0;
        localStorage.setItem('breathemate_daily_streak', (currentStreak + 1).toString());
    }
    
    window.location.href = 'dashboard.html';
}

// Utility function for showing messages
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        fontSize: '14px',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease',
        maxWidth: '400px'
    };
    
    switch (type) {
        case 'success':
            styles.background = '#38a169';
            break;
        case 'error':
            styles.background = '#e53e3e';
            break;
        case 'warning':
            styles.background = '#d69e2e';
            break;
        case 'info':
        default:
            styles.background = '#3182ce';
            break;
    }
    
    Object.assign(messageDiv.style, styles);
    document.body.appendChild(messageDiv);
    
    // Animate in
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Space bar to start/stop recording
    if (event.code === 'Space' && !event.target.matches('input, textarea')) {
        event.preventDefault();
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    }
    
    // Escape to go back to dashboard
    if (event.key === 'Escape') {
        goBackToDashboard();
    }
});

// Cleanup when page is unloaded
window.addEventListener('beforeunload', function() {
    if (isRecording) {
        stopRecording();
    }
    
    if (audioContext) {
        audioContext.close();
    }
});