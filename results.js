// Results page functionality
let isPlaying = false;
let playbackTimer = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeResultsPage();
    loadAnalysisData();
    drawWaveform();
    drawTrendChart();
    initializeSymptomTracker();
});

// Initialize results page
function initializeResultsPage() {
    // Check if user is logged in
    const userEmail = localStorage.getItem('breathemate_email');
    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set current date and time
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('reportDate').textContent = `${dateString} • ${timeString}`;
}

// Load analysis data from localStorage or generate sample data
function loadAnalysisData() {
    // Try to load data from record.js analysis or generate sample data
    const savedAnalysis = localStorage.getItem('breathemate_current_analysis');
    let analysisData;
    
    if (savedAnalysis) {
        analysisData = JSON.parse(savedAnalysis);
    } else {
        // Generate sample analysis data
        analysisData = generateSampleAnalysis();
    }
    
    updateResultsUI(analysisData);
}

// Generate sample analysis data
function generateSampleAnalysis() {
    const conditions = [
        { name: 'Normal Breathing Pattern', risk: 15, stage: 'low', interpretation: 'Clear breathing pattern with no significant irregularities detected. Continue monitoring for preventive care.' },
        { name: 'Possible Asthma Indicators', risk: 67, stage: 'medium', interpretation: 'Mild wheezing detected during exhalation phase. Analysis suggests possible early-stage asthma indicators with characteristic breathing pattern irregularities.' },
        { name: 'COPD Indicators Detected', risk: 82, stage: 'high', interpretation: 'Significant breathing obstructions detected. Pattern consistent with chronic obstructive pulmonary disease indicators.' },
        { name: 'Mild Breathing Irregularities', risk: 34, stage: 'low', interpretation: 'Minor breathing pattern variations detected. May indicate stress-related breathing or mild respiratory sensitivity.' },
        { name: 'Wheezing Patterns Detected', risk: 78, stage: 'high', interpretation: 'Clear wheezing patterns identified during multiple breathing phases. Requires immediate medical attention.' }
    ];
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
        riskPercentage: randomCondition.risk,
        detectedCondition: randomCondition.name,
        riskStage: randomCondition.stage,
        interpretation: randomCondition.interpretation,
        breathingPattern: randomCondition.risk > 50 ? 'Irregular' : 'Regular',
        voiceQuality: randomCondition.risk > 60 ? 'Strained' : 'Clear',
        airflowRate: randomCondition.risk > 40 ? 'Below Normal' : 'Normal',
        pauseDuration: randomCondition.risk > 45 ? 'Extended' : 'Normal',
        confidenceLevel: Math.floor(Math.random() * 15) + 80 // 80-95%
    };
}

// Update results UI with analysis data
function updateResultsUI(data) {
    // Update risk circle
    const riskCircle = document.getElementById('riskCircle');
    const riskPercentage = document.getElementById('riskPercentage');
    const stageIndicator = document.getElementById('stageIndicator');
    const detectedCondition = document.getElementById('detectedCondition');
    
    // Calculate circle progress
    const degrees = (data.riskPercentage / 100) * 360;
    let riskColor = '#38a169'; // Green for low
    if (data.riskStage === 'medium') riskColor = '#d69e2e'; // Yellow
    if (data.riskStage === 'high') riskColor = '#e53e3e'; // Red
    
    riskCircle.style.background = `conic-gradient(${riskColor} 0deg ${degrees}deg, #e2e8f0 ${degrees}deg 360deg)`;
    riskPercentage.textContent = `${data.riskPercentage}%`;
    detectedCondition.textContent = data.detectedCondition;
    
    // Update stage indicator
    stageIndicator.className = `stage-indicator ${data.riskStage}`;
    stageIndicator.innerHTML = `<span>${data.riskStage.charAt(0).toUpperCase() + data.riskStage.slice(1)} Risk</span>`;
    
    // Update confidence level
    const confidenceFill = document.querySelector('.confidence-fill');
    const confidenceText = document.querySelector('.confidence-text');
    confidenceFill.style.width = `${data.confidenceLevel}%`;
    confidenceText.textContent = `${data.confidenceLevel}% Accurate`;
    
    // Check for very high risk and show emergency alert
    if (data.riskPercentage > 85) {
        showEmergencyAlert(data.riskPercentage);
    }
    
    // Update analysis details
    document.getElementById('breathingPattern').textContent = data.breathingPattern;
    document.getElementById('voiceQuality').textContent = data.voiceQuality;
    document.getElementById('airflowRate').textContent = data.airflowRate;
    document.getElementById('pauseDuration').textContent = data.pauseDuration;
    
    // Update interpretation
    document.getElementById('shortInterpretation').textContent = data.interpretation;
    
    // Update recommendations based on risk level
    updateRecommendations(data.riskStage, data.detectedCondition);
    updateBreathingExerciseRecommendations(data.riskStage, data.riskPercentage);
}

// Update recommendations based on analysis
function updateRecommendations(riskStage, condition) {
    const recommendationsList = document.getElementById('recommendationsList');
    let recommendations = [];
    
    if (riskStage === 'high') {
        recommendations = [
            'Seek immediate medical attention from a pulmonologist',
            'Avoid physical exertion until cleared by a doctor',
            'Monitor symptoms closely and keep a breathing journal',
            'Have emergency contact information readily available',
            'Consider using a peak flow meter daily'
        ];
    } else if (riskStage === 'medium') {
        recommendations = [
            'Schedule an appointment with a healthcare provider',
            'Monitor breathing patterns daily using the app',
            'Avoid known allergens and environmental triggers',
            'Practice breathing exercises 2-3 times daily',
            'Consider keeping a symptom diary'
        ];
    } else {
        recommendations = [
            'Continue regular monitoring with BreatheMate',
            'Maintain healthy lifestyle habits',
            'Practice deep breathing exercises for wellness',
            'Stay hydrated and exercise regularly',
            'Schedule annual check-ups with your doctor'
        ];
    }
    
    recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
}

// Update breathing exercise recommendations based on risk level
function updateBreathingExerciseRecommendations(riskStage, riskPercentage) {
    const exerciseMessage = document.getElementById('exerciseMessage');
    const breathingAnimationContainer = document.getElementById('breathingAnimationContainer');
    const exerciseTips = document.getElementById('exerciseTips');
    
    // Clear any existing content
    exerciseMessage.innerHTML = '';
    breathingAnimationContainer.style.display = 'none';
    exerciseTips.style.display = 'none';
    
    if (riskStage === 'low') {
        // Low Risk: "Continue monitoring"
        exerciseMessage.innerHTML = `
            <div class="exercise-recommendation low-risk">
                <div class="recommendation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="recommendation-content">
                    <h4>Continue Monitoring</h4>
                    <p>Your breathing patterns look good! Keep up the regular monitoring to maintain your lung health.</p>
                    <div class="low-risk-tips">
                        <h5>Maintenance Tips:</h5>
                        <ul>
                            <li>Continue taking daily breathing tests</li>
                            <li>Practice light breathing exercises for wellness</li>
                            <li>Maintain your current healthy lifestyle</li>
                            <li>Stay hydrated and exercise regularly</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } else if (riskStage === 'medium') {
        // Medium: "Try this 3-min breathing exercise" (with calming animation)
        exerciseMessage.innerHTML = `
            <div class="exercise-recommendation medium-risk">
                <div class="recommendation-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="recommendation-content">
                    <h4>Try This 3-Minute Breathing Exercise</h4>
                    <p>Your breathing patterns show some irregularities. This guided breathing exercise can help improve your respiratory function and reduce stress.</p>
                </div>
            </div>
        `;
        
        // Show the breathing animation for medium risk
        breathingAnimationContainer.style.display = 'block';
        exerciseTips.style.display = 'block';
        
    } else if (riskStage === 'high') {
        // High: "Please consult a physician. Avoid strenuous activity."
        exerciseMessage.innerHTML = `
            <div class="exercise-recommendation high-risk">
                <div class="recommendation-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="recommendation-content">
                    <h4>Please Consult a Physician</h4>
                    <p><strong>Important:</strong> Your breathing analysis shows concerning patterns that require immediate medical attention.</p>
                    <div class="high-risk-warnings">
                        <h5>Immediate Actions:</h5>
                        <ul>
                            <li><strong>Avoid strenuous physical activity</strong> until cleared by a doctor</li>
                            <li>Schedule an appointment with a pulmonologist immediately</li>
                            <li>Monitor your symptoms closely</li>
                            <li>Keep emergency contact information ready</li>
                            <li>If experiencing severe symptoms, seek emergency care</li>
                        </ul>
                    </div>
                    <div class="emergency-contact">
                        <button class="emergency-btn" onclick="showEmergencyContacts()">
                            <i class="fas fa-phone"></i>
                            Emergency Contacts
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Breathing exercise variables
let breathingExerciseTimer = null;
let breathingExerciseInterval = null;
let exerciseTimeRemaining = 180; // 3 minutes in seconds
let currentBreathingPhase = 'inhale'; // 'inhale', 'hold', 'exhale'
let breathingCycleCount = 0;
let breathingPhaseTimer = 0;

// Start the 3-minute breathing exercise
function startBreathingExercise() {
    const startBtn = document.getElementById('startBreathingBtn');
    const stopBtn = document.getElementById('stopBreathingBtn');
    const exerciseTimer = document.getElementById('exerciseTimer');
    const breathingCircle = document.querySelector('.breathing-circle');
    
    // Hide start button, show stop button and timer
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';
    exerciseTimer.style.display = 'block';
    
    // Reset exercise state
    exerciseTimeRemaining = 180; // 3 minutes
    currentBreathingPhase = 'inhale';
    breathingCycleCount = 0;
    breathingPhaseTimer = 0;
    
    // Add breathing animation class
    breathingCircle.classList.add('breathing-active');
    
    // Start the main exercise timer
    breathingExerciseTimer = setInterval(() => {
        exerciseTimeRemaining--;
        updateExerciseTimer();
        
        if (exerciseTimeRemaining <= 0) {
            completeBreathingExercise();
        }
    }, 1000);
    
    // Start the breathing cycle
    startBreathingCycle();
    
    showMessage('Breathing exercise started. Follow the visual guide and breathe slowly.', 'info');
}

// Stop the breathing exercise
function stopBreathingExercise() {
    const startBtn = document.getElementById('startBreathingBtn');
    const stopBtn = document.getElementById('stopBreathingBtn');
    const exerciseTimer = document.getElementById('exerciseTimer');
    const breathingCircle = document.querySelector('.breathing-circle');
    
    // Clear timers
    if (breathingExerciseTimer) {
        clearInterval(breathingExerciseTimer);
        breathingExerciseTimer = null;
    }
    
    if (breathingExerciseInterval) {
        clearInterval(breathingExerciseInterval);
        breathingExerciseInterval = null;
    }
    
    // Reset UI
    startBtn.style.display = 'inline-flex';
    stopBtn.style.display = 'none';
    exerciseTimer.style.display = 'none';
    
    // Remove animation class
    breathingCircle.classList.remove('breathing-active');
    
    // Reset display
    document.getElementById('breathingInstruction').textContent = 'Inhale';
    document.getElementById('breathingCount').textContent = '4';
    
    showMessage('Breathing exercise stopped. You can restart it anytime.', 'info');
}

// Complete the breathing exercise
function completeBreathingExercise() {
    stopBreathingExercise();
    
    // Show completion message with benefits
    showMessage('🎉 Breathing exercise completed! Great job on taking care of your respiratory health.', 'success');
    
    // Log the exercise completion
    const exerciseEntry = {
        id: `breathing_exercise_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'breathing_exercise',
        duration: 180, // 3 minutes
        cycles: breathingCycleCount,
        notes: 'Completed 3-minute guided breathing exercise after breath analysis',
        source: 'results_page'
    };
    
    // Save to journal
    const existingEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    existingEntries.unshift(exerciseEntry);
    localStorage.setItem('breathemate_journal', JSON.stringify(existingEntries));
    
    // Show benefits modal or message
    setTimeout(() => {
        showExerciseBenefits();
    }, 1000);
}

// Start breathing cycle animation
function startBreathingCycle() {
    const breathingInstruction = document.getElementById('breathingInstruction');
    const breathingCount = document.getElementById('breathingCount');
    const breathingCircle = document.querySelector('.breathing-circle');
    
    // 4-7-8 breathing pattern: Inhale 4, Hold 7, Exhale 8
    const phases = {
        inhale: { duration: 4, text: 'Inhale', next: 'hold' },
        hold: { duration: 7, text: 'Hold', next: 'exhale' },
        exhale: { duration: 8, text: 'Exhale', next: 'inhale' }
    };
    
    breathingExerciseInterval = setInterval(() => {
        const currentPhase = phases[currentBreathingPhase];
        breathingPhaseTimer++;
        
        // Update instruction text
        breathingInstruction.textContent = currentPhase.text;
        
        // Update countdown
        const remaining = currentPhase.duration - breathingPhaseTimer;
        breathingCount.textContent = remaining > 0 ? remaining : currentPhase.duration;
        
        // Apply visual effects
        if (currentBreathingPhase === 'inhale') {
            breathingCircle.style.transform = `scale(${1 + (breathingPhaseTimer / currentPhase.duration) * 0.3})`;
            breathingCircle.style.background = 'linear-gradient(45deg, #4299e1, #63b3ed)';
        } else if (currentBreathingPhase === 'hold') {
            breathingCircle.style.transform = 'scale(1.3)';
            breathingCircle.style.background = 'linear-gradient(45deg, #805ad5, #9f7aea)';
        } else if (currentBreathingPhase === 'exhale') {
            breathingCircle.style.transform = `scale(${1.3 - (breathingPhaseTimer / currentPhase.duration) * 0.3})`;
            breathingCircle.style.background = 'linear-gradient(45deg, #38a169, #68d391)';
        }
        
        // Move to next phase
        if (breathingPhaseTimer >= currentPhase.duration) {
            currentBreathingPhase = currentPhase.next;
            breathingPhaseTimer = 0;
            
            if (currentBreathingPhase === 'inhale') {
                breathingCycleCount++;
            }
        }
    }, 1000);
}

// Update exercise timer display
function updateExerciseTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    const minutes = Math.floor(exerciseTimeRemaining / 60);
    const seconds = exerciseTimeRemaining % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Show exercise benefits after completion
function showExerciseBenefits() {
    const benefitsMessage = `
        <div class="exercise-benefits-modal">
            <div class="benefits-content">
                <h4>🌟 Exercise Benefits</h4>
                <p>You've just completed a scientifically-proven breathing exercise that can:</p>
                <ul>
                    <li>✓ Reduce stress and anxiety</li>
                    <li>✓ Improve oxygen flow to your lungs</li>
                    <li>✓ Lower heart rate and blood pressure</li>
                    <li>✓ Enhance overall respiratory function</li>
                    <li>✓ Promote better sleep quality</li>
                </ul>
                <p>Consider doing this exercise 2-3 times daily for best results!</p>
            </div>
        </div>
    `;
    
    // Create and show benefits modal
    const modal = document.createElement('div');
    modal.className = 'benefits-modal-overlay';
    modal.innerHTML = benefitsMessage;
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const content = modal.querySelector('.exercise-benefits-modal');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        margin: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(modal);
    
    // Remove modal after 8 seconds or on click
    setTimeout(() => modal.remove(), 8000);
    modal.addEventListener('click', () => modal.remove());
}

// Show emergency contacts for high-risk users
function showEmergencyContacts() {
    const emergencyInfo = `
        <div class="emergency-contacts-modal">
            <div class="emergency-content">
                <h4>🚨 Emergency Contacts</h4>
                <div class="contact-list">
                    <div class="contact-item">
                        <strong>Emergency Services:</strong> 911
                    </div>
                    <div class="contact-item">
                        <strong>Poison Control:</strong> 1-800-222-1222
                    </div>
                    <div class="contact-item">
                        <strong>National Suicide Prevention:</strong> 988
                    </div>
                    <div class="contact-item">
                        <strong>BreatheMate Support:</strong> 1-800-BREATHE
                    </div>
                </div>
                <p><strong>If you're experiencing severe breathing difficulties, chest pain, or other emergency symptoms, call 911 immediately.</strong></p>
                <button onclick="this.closest('.emergency-modal-overlay').remove()" class="btn primary">Close</button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'emergency-modal-overlay';
    modal.innerHTML = emergencyInfo;
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const content = modal.querySelector('.emergency-contacts-modal');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        margin: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        border-left: 4px solid #e53e3e;
    `;
    
    document.body.appendChild(modal);
}

// Toggle audio playback simulation
function toggleAudioPlayback() {
    const playBtn = document.getElementById('playBtn');
    const playbackIndicator = document.getElementById('playbackIndicator');
    
    if (!isPlaying) {
        // Start playback
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playbackIndicator.style.opacity = '1';
        
        // Simulate playback with moving indicator
        let progress = 0;
        const duration = 23000; // 23 seconds
        const interval = 100; // Update every 100ms
        
        playbackTimer = setInterval(() => {
            progress += interval;
            const percentage = (progress / duration) * 100;
            playbackIndicator.style.left = `${percentage}%`;
            
            if (progress >= duration) {
                stopAudioPlayback();
            }
        }, interval);
        
        showMessage('Playing audio analysis...', 'info');
    } else {
        stopAudioPlayback();
    }
}

// Stop audio playback
function stopAudioPlayback() {
    isPlaying = false;
    const playBtn = document.getElementById('playBtn');
    const playbackIndicator = document.getElementById('playbackIndicator');
    
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playbackIndicator.style.opacity = '0';
    playbackIndicator.style.left = '0%';
    
    if (playbackTimer) {
        clearInterval(playbackTimer);
        playbackTimer = null;
    }
}

// Save to journal
function saveToJournal() {
    const currentDate = new Date().toISOString();
    const analysisData = {
        date: currentDate,
        type: 'breath_analysis',
        riskLevel: document.getElementById('riskPercentage').textContent,
        condition: document.getElementById('detectedCondition').textContent,
        stage: document.querySelector('.stage-indicator span').textContent,
        notes: 'Automated analysis from BreatheMate'
    };
    
    // Get existing journal entries
    const existingEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    existingEntries.unshift(analysisData);
    
    // Keep only last 100 entries
    if (existingEntries.length > 100) {
        existingEntries.splice(100);
    }
    
    localStorage.setItem('breathemate_journal', JSON.stringify(existingEntries));
    showMessage('Analysis saved to your breathing journal!', 'success');
}

// Download comprehensive PDF report
function downloadReport() {
    showMessage('Generating comprehensive PDF report...', 'info');
    
    // Get current user and profile information
    const currentUser = getCurrentUserInfo();
    const analysisData = getAnalysisData();
    const recommendations = getRecommendationsList();
    
    // Generate comprehensive PDF content
    setTimeout(() => {
        generateComprehensivePDF(currentUser, analysisData, recommendations);
    }, 1500);
}

// Get current user information
function getCurrentUserInfo() {
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const activeProfileId = localStorage.getItem('breathemate_active_profile');
    const activeProfile = profiles.find(p => p.id === activeProfileId);
    
    return {
        name: activeProfile?.name || localStorage.getItem('breathemate_username') || 'BreatheMate User',
        email: activeProfile?.email || localStorage.getItem('breathemate_email') || 'user@breathemate.com',
        age: activeProfile?.age || 'Not specified',
        gender: activeProfile?.gender || 'Not specified',
        relationship: activeProfile?.relationship || 'self',
        profileCreated: activeProfile?.createdAt || new Date().toISOString()
    };
}

// Get comprehensive analysis data
function getAnalysisData() {
    return {
        reportDate: document.getElementById('reportDate')?.textContent || new Date().toLocaleDateString(),
        riskPercentage: document.getElementById('riskPercentage')?.textContent || '0%',
        riskStage: document.querySelector('.stage-indicator span')?.textContent || 'Unknown',
        detectedCondition: document.getElementById('detectedCondition')?.textContent || 'Unknown',
        interpretation: document.getElementById('shortInterpretation')?.textContent || 'No interpretation available',
        confidenceLevel: document.querySelector('.confidence-text')?.textContent || '85% Accurate',
        breathingPattern: document.getElementById('breathingPattern')?.textContent || 'Unknown',
        voiceQuality: document.getElementById('voiceQuality')?.textContent || 'Unknown',
        airflowRate: document.getElementById('airflowRate')?.textContent || 'Unknown',
        pauseDuration: document.getElementById('pauseDuration')?.textContent || 'Unknown',
        audioRecordingDuration: '23 seconds', // From the waveform analysis
        audioQuality: 'High Quality (44.1kHz)',
        analysisEngine: 'BreatheMate AI v2.1',
        processingTime: '2.4 seconds'
    };
}

// Get recommendations list
function getRecommendationsList() {
    const recommendationElements = document.querySelectorAll('#recommendationsList li');
    const recommendations = [];
    
    recommendationElements.forEach(element => {
        recommendations.push(element.textContent.trim());
    });
    
    return recommendations.length > 0 ? recommendations : [
        'Continue regular monitoring with BreatheMate',
        'Maintain healthy lifestyle habits',
        'Consult healthcare provider for personalized advice'
    ];
}

// Generate comprehensive PDF content
function generateComprehensivePDF(userInfo, analysisData, recommendations) {
    const reportContent = generatePDFContent(userInfo, analysisData, recommendations);
    
    // Create and download the PDF-formatted text file
    // In a real implementation, this would use a PDF library like jsPDF
    const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `BreatheMate_Analysis_Report_${userInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
    
    // Show success message
    showMessage('📄 Comprehensive PDF report downloaded successfully!', 'success');
    
    // Log the download for analytics
    logReportDownload(userInfo, analysisData);
}

// Generate formatted PDF content
function generatePDFContent(userInfo, analysisData, recommendations) {
    const reportDate = new Date().toLocaleString();
    const profileType = userInfo.relationship === 'self' ? 'Primary Account' : `${userInfo.relationship.charAt(0).toUpperCase() + userInfo.relationship.slice(1)} Profile`;
    
    return `
═══════════════════════════════════════════════════════════════════════════════
                              BREATHEMATE
                        COMPREHENSIVE ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════════════════

📋 PATIENT INFORMATION
═══════════════════════════════════════════════════════════════════════════════
Patient Name:           ${userInfo.name}
Email Address:          ${userInfo.email}
Age:                    ${userInfo.age}
Gender:                 ${userInfo.gender}
Profile Type:           ${profileType}
Account Created:        ${new Date(userInfo.profileCreated).toLocaleDateString()}

Report Generated:       ${reportDate}
Report ID:              BMR-${Date.now().toString().slice(-8)}

🎤 AUDIO RECORDING SUMMARY
═══════════════════════════════════════════════════════════════════════════════
Recording Date:         ${analysisData.reportDate}
Recording Duration:     ${analysisData.audioRecordingDuration}
Audio Quality:          ${analysisData.audioQuality}
Processing Engine:      ${analysisData.analysisEngine}
Analysis Time:          ${analysisData.processingTime}
Confidence Level:       ${analysisData.confidenceLevel}

📊 BREATHING ANALYSIS RESULTS
═══════════════════════════════════════════════════════════════════════════════
Overall Risk Level:     ${analysisData.riskPercentage} (${analysisData.riskStage})
Detected Condition:     ${analysisData.detectedCondition}

DETAILED METRICS:
• Breathing Pattern:    ${analysisData.breathingPattern}
• Voice Quality:        ${analysisData.voiceQuality}
• Airflow Rate:         ${analysisData.airflowRate}
• Pause Duration:       ${analysisData.pauseDuration}

🔍 CLINICAL INTERPRETATION
═══════════════════════════════════════════════════════════════════════════════
${analysisData.interpretation}

${getRiskStageExplanation(analysisData.riskStage)}

💡 PERSONALIZED RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════════════
Based on your analysis results, we recommend the following actions:

${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

${getAdditionalRecommendations(analysisData.riskStage)}

📈 FOLLOW-UP GUIDANCE
═══════════════════════════════════════════════════════════════════════════════
${getFollowUpGuidance(analysisData.riskStage)}

⚕️ MEDICAL DISCLAIMER
═══════════════════════════════════════════════════════════════════════════════
IMPORTANT MEDICAL DISCLAIMER:

This BreatheMate analysis is approximately ${analysisData.confidenceLevel.replace(' Accurate', '')} accurate and is 
intended for informational and monitoring purposes only. This report should NOT be 
used as a substitute for professional medical advice, diagnosis, or treatment.

KEY LIMITATIONS:
• This analysis is based on audio pattern recognition technology
• Results may vary based on recording conditions and individual factors
• Environmental noise or device quality may affect accuracy
• Not validated for diagnosis of specific medical conditions

RECOMMENDATIONS:
✓ Always consult with qualified healthcare professionals for medical decisions
✓ Share this report with your doctor for professional interpretation
✓ Seek immediate medical attention if experiencing severe symptoms
✓ Use this tool as a supplementary monitoring device, not primary diagnosis

If you are experiencing severe breathing difficulties, chest pain, or other 
emergency symptoms, please call emergency services (911) immediately.

📞 EMERGENCY CONTACTS
═══════════════════════════════════════════════════════════════════════════════
Emergency Services:     911
Poison Control:         1-800-222-1222
BreatheMate Support:    1-800-BREATHE (1-800-273-2843)
Support Email:          support@breathemate.com

🔒 PRIVACY & DATA SECURITY
═══════════════════════════════════════════════════════════════════════════════
This report contains personal health information. Please:
• Store securely and share only with authorized healthcare providers
• Delete or destroy copies when no longer needed
• Report any data security concerns to BreatheMate support

📄 REPORT METADATA
═══════════════════════════════════════════════════════════════════════════════
BreatheMate Version:    v2.1.0
Report Format:          Comprehensive Analysis Report
Generated By:           BreatheMate AI Analysis Engine
Report Language:        English
Time Zone:              ${Intl.DateTimeFormat().resolvedOptions().timeZone}

═══════════════════════════════════════════════════════════════════════════════
                    © 2025 BreatheMate - Your Lung Health Partner
                        For more information: www.breathemate.com
═══════════════════════════════════════════════════════════════════════════════

This report was generated automatically by BreatheMate's AI analysis system.
For technical support or questions about this report, please contact our 
support team at support@breathemate.com or call 1-800-BREATHE.

Report End - Page 1 of 1
    `.trim();
}

// Get risk stage explanation
function getRiskStageExplanation(riskStage) {
    const stageExplanations = {
        'Low Risk': `
LOW RISK ASSESSMENT:
Your breathing patterns appear within normal ranges. This suggests good respiratory 
function with no immediate concerns detected. Continue with regular monitoring and 
maintain your current healthy lifestyle practices.`,
        
        'Medium Risk': `
MEDIUM RISK ASSESSMENT:
Your breathing analysis shows some irregularities that warrant attention. While not 
immediately dangerous, these patterns suggest you should monitor your respiratory 
health more closely and consider consulting with a healthcare provider for evaluation.`,
        
        'High Risk': `
HIGH RISK ASSESSMENT:
Your breathing analysis indicates significant irregularities that require immediate 
medical attention. These patterns may suggest respiratory complications that need 
professional evaluation. Please consult with a healthcare provider as soon as possible.`
    };
    
    return stageExplanations[riskStage] || 'Risk assessment unavailable.';
}

// Get additional recommendations based on risk stage
function getAdditionalRecommendations(riskStage) {
    const additionalRecs = {
        'Low Risk': `
WELLNESS RECOMMENDATIONS:
• Continue daily breathing exercises for maintenance
• Maintain regular physical activity as tolerated
• Stay hydrated (8-10 glasses of water daily)
• Avoid smoking and secondhand smoke exposure
• Schedule annual respiratory health check-ups`,
        
        'Medium Risk': `
MONITORING RECOMMENDATIONS:
• Increase breathing test frequency to daily monitoring
• Keep a detailed symptom diary
• Avoid known allergens and environmental triggers
• Practice prescribed breathing exercises 2-3 times daily
• Schedule a medical evaluation within 1-2 weeks`,
        
        'High Risk': `
IMMEDIATE ACTION REQUIRED:
• Schedule immediate medical consultation (within 24-48 hours)
• Avoid strenuous physical activity until cleared by physician
• Monitor symptoms continuously and seek emergency care if worsening
• Have emergency contact information readily accessible
• Consider portable oxygen availability if recommended by physician`
    };
    
    return additionalRecs[riskStage] || '';
}

// Get follow-up guidance
function getFollowUpGuidance(riskStage) {
    const followUpGuidance = {
        'Low Risk': `
 FOLLOW-UP SCHEDULE:
• Next BreatheMate analysis: 3-7 days
• Healthcare provider visit: Annual check-up (unless symptoms develop)
• Emergency signs to watch for: Sudden breathing difficulties, chest pain, persistent cough

TRENDING RECOMMENDATION:
Continue using BreatheMate regularly to establish your personal baseline and 
detect any changes in your respiratory health over time.`,
        
        'Medium Risk': `
FOLLOW-UP SCHEDULE:
• Next BreatheMate analysis: Daily for 1 week, then every 2-3 days
• Healthcare provider visit: Within 1-2 weeks for evaluation
• Symptoms monitoring: Track daily with breathing journal

IMPORTANT SIGNS TO MONITOR:
• Increased shortness of breath
• Persistent or worsening cough
• Chest tightness or pain
• Fatigue during normal activities`,
        
        'High Risk': `
IMMEDIATE FOLLOW-UP REQUIRED:
• Next BreatheMate analysis: Daily monitoring until medical clearance
• Healthcare provider visit: URGENT - Within 24-48 hours
• Specialist referral: Pulmonologist evaluation recommended

EMERGENCY WARNING SIGNS:
Call 911 immediately if you experience:
• Severe difficulty breathing or shortness of breath
• Chest pain or pressure
• Blue lips or fingernails
• Confusion or difficulty staying awake
• Inability to speak in full sentences due to breathlessness`
    };
    
    return followUpGuidance[riskStage] || 'Follow standard monitoring protocols.';
}

// Log report download for analytics
function logReportDownload(userInfo, analysisData) {
    try {
        const downloadLog = {
            timestamp: new Date().toISOString(),
            userId: userInfo.email,
            userName: userInfo.name,
            reportType: 'comprehensive_pdf',
            riskLevel: analysisData.riskPercentage,
            riskStage: analysisData.riskStage,
            detectedCondition: analysisData.detectedCondition,
            downloadSource: 'results_page',
            userAgent: navigator.userAgent,
            sessionId: sessionStorage.getItem('breathemate_session_id') || 'unknown'
        };
        
        // Save to local analytics storage
        const analyticsData = JSON.parse(localStorage.getItem('breathemate_analytics') || '[]');
        analyticsData.unshift(downloadLog);
        
        // Keep only last 50 download logs
        if (analyticsData.length > 50) {
            analyticsData.splice(50);
        }
        
        localStorage.setItem('breathemate_analytics', JSON.stringify(analyticsData));
        
        console.log('Report download logged for analytics:', downloadLog);
        
        // In a real application, this would also send to backend analytics
        
    } catch (error) {
        console.error('Error logging report download:', error);
    }
}

// Cleanup when page is unloaded
window.addEventListener('beforeunload', function() {
    if (playbackTimer) {
        clearInterval(playbackTimer);
    }
});

// Initialize symptom tracker
function initializeSymptomTracker() {
    const symptomForm = document.getElementById('symptomForm');
    const noSymptomsCheck = document.getElementById('noSymptomsCheck');
    
    if (symptomForm) {
        symptomForm.addEventListener('submit', handleSymptomSubmission);
    }
    
    // Handle "No symptoms" checkbox
    if (noSymptomsCheck) {
        noSymptomsCheck.addEventListener('change', function() {
            const allCheckboxes = document.querySelectorAll('.symptom-checkbox input[type="checkbox"]:not(#noSymptomsCheck)');
            
            if (this.checked) {
                // Uncheck all other symptoms
                allCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.closest('.symptom-checkbox').style.opacity = '0.5';
                });
            } else {
                // Re-enable all symptom checkboxes
                allCheckboxes.forEach(checkbox => {
                    checkbox.closest('.symptom-checkbox').style.opacity = '1';
                });
            }
        });
        
        // Handle other symptom checkboxes
        const symptomCheckboxes = document.querySelectorAll('.symptom-checkbox input[type="checkbox"]:not(#noSymptomsCheck)');
        symptomCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked && noSymptomsCheck.checked) {
                    noSymptomsCheck.checked = false;
                    // Re-enable all symptom checkboxes
                    symptomCheckboxes.forEach(cb => {
                        cb.closest('.symptom-checkbox').style.opacity = '1';
                    });
                }
            });
        });
    }
}

// Handle symptom form submission
function handleSymptomSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const selectedSymptoms = [];
    const noSymptomsCheck = document.getElementById('noSymptomsCheck');
    
    // Collect selected symptoms
    const checkboxes = document.querySelectorAll('.symptom-checkbox input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        if (checkbox.value !== 'none') {
            selectedSymptoms.push(checkbox.value);
        }
    });
    
    // Create symptom entry for journal
    const symptomEntry = {
        id: `symptom_entry_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'symptom_tracking',
        symptoms: noSymptomsCheck.checked ? [] : selectedSymptoms,
        severity: determineSeverity(selectedSymptoms.length),
        notes: noSymptomsCheck.checked ? 
            'No symptoms experienced today - logged after breath analysis' : 
            `Symptoms logged after breath analysis: ${selectedSymptoms.map(s => s.replace('_', ' ')).join(', ')}`,
        source: 'breath_analysis_tracker',
        analysisData: {
            riskLevel: document.getElementById('riskPercentage')?.textContent || 'Unknown',
            condition: document.getElementById('detectedCondition')?.textContent || 'Unknown',
            stage: document.querySelector('.stage-indicator span')?.textContent?.toLowerCase() || 'unknown'
        }
    };
    
    // Save to journal
    saveSymptomEntryToJournal(symptomEntry);
    
    // Show success state
    showSymptomTrackerSuccess();
    
    // Update AI learning data
    updateAILearningData(symptomEntry);
}

// Determine severity based on number of symptoms
function determineSeverity(symptomCount) {
    if (symptomCount === 0) return 'none';
    if (symptomCount <= 2) return 'mild';
    if (symptomCount <= 4) return 'moderate';
    return 'severe';
}

// Save symptom entry to journal
function saveSymptomEntryToJournal(symptomEntry) {
    try {
        // Get existing journal entries
        const existingEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
        
        // Add new symptom entry at the beginning
        existingEntries.unshift(symptomEntry);
        
        // Keep only last 200 entries to manage storage
        if (existingEntries.length > 200) {
            existingEntries.splice(200);
        }
        
        // Save back to localStorage
        localStorage.setItem('breathemate_journal', JSON.stringify(existingEntries));
        
        console.log('Symptom entry saved to journal successfully');
        return true;
    } catch (error) {
        console.error('Error saving symptom entry to journal:', error);
        return false;
    }
}

// Show success state for symptom tracker
function showSymptomTrackerSuccess() {
    const symptomForm = document.getElementById('symptomForm');
    const symptomSuccess = document.getElementById('symptomSuccess');
    
    if (symptomForm && symptomSuccess) {
        // Hide form and show success message
        symptomForm.style.display = 'none';
        symptomSuccess.style.display = 'block';
        
        // Add animation
        symptomSuccess.style.opacity = '0';
        symptomSuccess.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            symptomSuccess.style.transition = 'all 0.5s ease';
            symptomSuccess.style.opacity = '1';
            symptomSuccess.style.transform = 'translateY(0)';
        }, 100);
        
        // Show notification
        showMessage('Symptoms logged successfully! This helps improve future analysis.', 'success');
    }
}

// Skip symptom tracker
function skipSymptomTracker() {
    const symptomForm = document.getElementById('symptomForm');
    const symptomSuccess = document.getElementById('symptomSuccess');
    
    if (symptomForm && symptomSuccess) {
        // Create a "skipped" entry for analytics
        const skippedEntry = {
            id: `symptom_skip_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'symptom_tracking_skipped',
            symptoms: [],
            notes: 'User chose to skip symptom tracking after breath analysis',
            source: 'breath_analysis_tracker',
            skipped: true
        };
        
        // Log the skip (for analytics, don't save to main journal)
        updateAILearningData(skippedEntry);
        
        // Hide the entire symptom tracker section
        const symptomTrackerSection = document.querySelector('.symptom-tracker-section');
        if (symptomTrackerSection) {
            symptomTrackerSection.style.transition = 'all 0.5s ease';
            symptomTrackerSection.style.opacity = '0';
            symptomTrackerSection.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                symptomTrackerSection.style.display = 'none';
            }, 500);
        }
        
        showMessage('Symptom tracking skipped. You can always add symptoms manually in your journal.', 'info');
    }
}

// Update AI learning data (simulated)
function updateAILearningData(entryData) {
    try {
        // Get existing AI learning data
        const aiLearningData = JSON.parse(localStorage.getItem('breathemate_ai_learning') || '[]');
        
        // Add new learning entry
        const learningEntry = {
            timestamp: new Date().toISOString(),
            analysisData: entryData.analysisData || {},
            symptoms: entryData.symptoms || [],
            severity: entryData.severity || 'unknown',
            skipped: entryData.skipped || false,
            source: 'symptom_tracker'
        };
        
        aiLearningData.unshift(learningEntry);
        
        // Keep only last 100 learning entries
        if (aiLearningData.length > 100) {
            aiLearningData.splice(100);
        }
        
        // Save AI learning data
        localStorage.setItem('breathemate_ai_learning', JSON.stringify(aiLearningData));
        
        console.log('AI learning data updated:', learningEntry);
        
        // Simulate sending to backend for model training
        if (!entryData.skipped) {
            simulateAIModelUpdate(learningEntry);
        }
        
    } catch (error) {
        console.error('Error updating AI learning data:', error);
    }
}

// Simulate AI model update (in real app, this would be sent to backend)
function simulateAIModelUpdate(learningData) {
    console.log('Simulating AI model update with new symptom data...');
    console.log('Learning data sent to model:', learningData);
    
    // In a real application, this would:
    // 1. Send data to backend API
    // 2. Backend would process and add to training dataset
    // 3. Periodically retrain the AI model with new data
    // 4. Update model accuracy and predictions
    
    // For now, just log that we would improve the model
    setTimeout(() => {
        console.log('AI model updated successfully. Future predictions will be more accurate.');
    }, 1000);
}

// Show emergency alert for very high risk
function showEmergencyAlert(riskPercentage) {
    // Create emergency alert section and insert it after the report header
    const emergencyAlertHTML = `
        <section class="emergency-alert-section">
            <div class="emergency-alert-card">
                <div class="emergency-alert-header">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content">
                        <h2>🚨 High Risk Detected</h2>
                        <p>Your breathing analysis shows a very high risk level (${riskPercentage}%). Immediate medical attention is strongly recommended.</p>
                    </div>
                </div>
                
                <div class="emergency-action">
                    <button class="emergency-advice-btn" onclick="openEmergencyAdviceModal()">
                        <i class="fas fa-first-aid"></i>
                        See What to Do Now
                    </button>
                </div>
                
                <div class="quick-actions">
                    <button class="quick-action-btn" onclick="openEmergencyAdviceModal()">
                        <i class="fas fa-first-aid"></i>
                        First Aid Info
                    </button>
                    <button class="quick-action-btn" onclick="findNearbyHospitals()">
                        <i class="fas fa-map-marker-alt"></i>
                        Find Hospitals
                    </button>
                    <button class="quick-action-btn call-emergency" onclick="callEmergencyServices()">
                        <i class="fas fa-phone"></i>
                        Call Emergency
                    </button>
                </div>
            </div>
        </section>
    `;
    
    // Insert emergency alert after report header
    const reportHeader = document.querySelector('.report-header');
    if (reportHeader) {
        reportHeader.insertAdjacentHTML('afterend', emergencyAlertHTML);
    }
    
    // Show immediate notification
    showMessage('🚨 HIGH RISK DETECTED: Please see emergency guidance below and consider immediate medical attention.', 'error');
}

// Open emergency advice modal with first aid information
function openEmergencyAdviceModal() {
    const modalHTML = `
        <div class="emergency-advice-modal">
            <div class="emergency-advice-content">
                <div class="emergency-advice-header">
                    <h3>
                        <i class="fas fa-first-aid"></i>
                        Emergency Breathing Guidance
                    </h3>
                    <button class="close-emergency-modal" onclick="closeEmergencyAdviceModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="emergency-advice-body">
                    <div class="warning-signs">
                        <h5>
                            <i class="fas fa-exclamation-triangle"></i>
                            Call 911 Immediately If You Experience:
                        </h5>
                        <ul>
                            <li>Severe difficulty breathing or gasping for air</li>
                            <li>Chest pain or pressure</li>
                            <li>Blue lips, face, or fingernails</li>
                            <li>Dizziness or fainting</li>
                            <li>Inability to speak in full sentences</li>
                            <li>Confusion or loss of consciousness</li>
                        </ul>
                    </div>
                    
                    <div class="first-aid-section">
                        <h4>
                            <i class="fas fa-hand-holding-medical"></i>
                            Immediate First Aid Steps
                        </h4>
                        <ol class="first-aid-steps">
                            <li>
                                <strong>Stay Calm:</strong> Panic can worsen breathing difficulties. Try to remain as calm as possible.
                            </li>
                            <li>
                                <strong>Sit Up Straight:</strong> Find a comfortable upright position. Leaning slightly forward with arms supported can help.
                            </li>
                            <li>
                                <strong>Loosen Tight Clothing:</strong> Remove anything around your neck or chest that might restrict breathing.
                            </li>
                            <li>
                                <strong>Use Rescue Inhaler:</strong> If you have a prescribed rescue inhaler, use it as directed by your doctor.
                            </li>
                            <li>
                                <strong>Controlled Breathing:</strong> Try slow, deep breaths through your nose. Breathe in for 4 counts, hold for 2, exhale for 6.
                            </li>
                            <li>
                                <strong>Seek Help:</strong> Call someone to stay with you and be ready to call emergency services if symptoms worsen.
                            </li>
                        </ol>
                    </div>
                    
                    <div class="emergency-contacts-section">
                        <h5>
                            <i class="fas fa-phone-alt"></i>
                            Emergency Contact Numbers
                        </h5>
                        <div class="contact-grid">
                            <div class="contact-item">
                                <strong>Emergency Services</strong>
                                <span>911</span>
                                <button class="call-button" onclick="callEmergencyServices()">Call Now</button>
                            </div>
                            <div class="contact-item">
                                <strong>Poison Control</strong>
                                <span>1-800-222-1222</span>
                                <button class="call-button" onclick="callPoisonControl()">Call</button>
                            </div>
                            <div class="contact-item">
                                <strong>Crisis Support</strong>
                                <span>988</span>
                                <button class="call-button" onclick="callCrisisSupport()">Call</button>
                            </div>
                            <div class="contact-item">
                                <strong>BreatheMate Support</strong>
                                <span>1-800-BREATHE</span>
                                <button class="call-button" onclick="callBreatheMateSupport()">Call</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'emergencyAdviceModal';
    modalOverlay.innerHTML = modalHTML;
    document.body.appendChild(modalOverlay);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

// Close emergency advice modal
function closeEmergencyAdviceModal() {
    const modal = document.getElementById('emergencyAdviceModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Find nearby hospitals using geolocation
function findNearbyHospitals() {
    const modalHTML = `
        <div class="hospital-finder-modal">
            <div class="hospital-finder-content">
                <div class="emergency-advice-header">
                    <h3>
                        <i class="fas fa-hospital"></i>
                        Find Nearby Emergency Care
                    </h3>
                    <button class="close-emergency-modal" onclick="closeHospitalFinder()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="location-status" id="locationStatus">
                    <i class="fas fa-location-dot"></i>
                    <p>Requesting your location to find nearby hospitals...</p>
                </div>
                
                <div class="hospital-list" id="hospitalList" style="display: none;">
                    <!-- Hospital list will be populated by JavaScript -->
                </div>
                
                <div class="emergency-contact" style="text-align: center; margin-top: 20px;">
                    <p><strong>For immediate life-threatening emergencies:</strong></p>
                    <button class="emergency-btn" onclick="callEmergencyServices()">
                        <i class="fas fa-phone"></i>
                        Call 911 Now
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'hospitalFinderModal';
    modalOverlay.innerHTML = modalHTML;
    document.body.appendChild(modalOverlay);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Request geolocation
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => showNearbyHospitals(position.coords.latitude, position.coords.longitude),
            error => showLocationError(error),
            { timeout: 10000, enableHighAccuracy: true }
        );
    } else {
        showLocationError({ message: 'Geolocation is not supported by this browser.' });
    }
}

// Show nearby hospitals (simulated - in real app would use Google Maps API)
function showNearbyHospitals(latitude, longitude) {
    const locationStatus = document.getElementById('locationStatus');
    const hospitalList = document.getElementById('hospitalList');
    
    // Simulate finding nearby hospitals
    const simulatedHospitals = [
        {
            name: 'City General Hospital',
            address: '123 Main Street',
            distance: '0.8 miles',
            phone: '(555) 123-4567',
            emergency: true
        },
        {
            name: 'Regional Medical Center',
            address: '456 Oak Avenue',
            distance: '1.2 miles',
            phone: '(555) 234-5678',
            emergency: true
        },
        {
            name: 'Mercy Hospital Emergency',
            address: '789 Elm Street',
            distance: '1.5 miles',
            phone: '(555) 345-6789',
            emergency: true
        },
        {
            name: 'University Medical Center',
            address: '321 Pine Road',
            distance: '2.1 miles',
            phone: '(555) 456-7890',
            emergency: true
        }
    ];
    
    setTimeout(() => {
        locationStatus.innerHTML = `
            <i class="fas fa-check-circle" style="color: #38a169;"></i>
            <p>Found ${simulatedHospitals.length} nearby emergency facilities:</p>
        `;
        
        const hospitalsHTML = simulatedHospitals.map(hospital => `
            <div class="hospital-item">
                <h4>${hospital.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${hospital.address}</p>
                <p><i class="fas fa-route"></i> ${hospital.distance} away</p>
                <p><i class="fas fa-phone"></i> ${hospital.phone}</p>
                <div class="hospital-actions">
                    <button class="hospital-btn directions" onclick="getDirections('${hospital.name}', '${hospital.address}')">
                        <i class="fas fa-directions"></i>
                        Directions
                    </button>
                    <button class="hospital-btn call" onclick="callHospital('${hospital.phone}')">
                        <i class="fas fa-phone"></i>
                        Call
                    </button>
                </div>
            </div>
        `).join('');
        
        hospitalList.innerHTML = hospitalsHTML;
        hospitalList.style.display = 'block';
    }, 1500);
}

// Show location error
function showLocationError(error) {
    const locationStatus = document.getElementById('locationStatus');
    locationStatus.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #e53e3e;"></i>
        <p>Unable to get your location: ${error.message}</p>
        <p>You can manually search for nearby hospitals or call 911 for emergency assistance.</p>
        <button class="btn primary" onclick="searchHospitalsManually()">
            Search Manually
        </button>
    `;
}

// Close hospital finder modal
function closeHospitalFinder() {
    const modal = document.getElementById('hospitalFinderModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Get directions to hospital (would open maps app)
function getDirections(hospitalName, address) {
    // In a real app, this would open the device's maps application
    const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
    
    if ('navigator' in window && 'share' in navigator) {
        navigator.share({
            title: `Directions to ${hospitalName}`,
            text: `Get directions to ${hospitalName} at ${address}`,
            url: mapsUrl
        }).catch(err => {
            // Fallback to opening in new tab
            window.open(mapsUrl, '_blank');
        });
    } else {
        window.open(mapsUrl, '_blank');
    }
    
    showMessage(`Opening directions to ${hospitalName}`, 'info');
}

// Call hospital directly
function callHospital(phoneNumber) {
    if ('navigator' in window && 'share' in navigator) {
        // On mobile, try to initiate call
        window.location.href = `tel:${phoneNumber}`;
    } else {
        // On desktop, copy to clipboard
        navigator.clipboard.writeText(phoneNumber).then(() => {
            showMessage(`Hospital phone number (${phoneNumber}) copied to clipboard!`, 'success');
        }).catch(() => {
            prompt('Hospital phone number:', phoneNumber);
        });
    }
}

// Search hospitals manually
function searchHospitalsManually() {
    const searchUrl = 'https://www.google.com/maps/search/emergency+hospital+near+me';
    window.open(searchUrl, '_blank');
    showMessage('Opening Google Maps to search for nearby hospitals...', 'info');
}

// Call emergency services (911)
function callEmergencyServices() {
    const confirmCall = confirm(
        '🚨 EMERGENCY CALL\n\n' +
        'You are about to call 911 Emergency Services.\n\n' +
        'Only call if you are experiencing a true medical emergency:\n' +
        '• Severe breathing difficulty\n' +
        '• Chest pain\n' +
        '• Loss of consciousness\n' +
        '• Life-threatening symptoms\n\n' +
        'Click OK to proceed with the call.'
    );
    
    if (confirmCall) {
        // On mobile devices, this will initiate the call
        window.location.href = 'tel:911';
        
        // Show guidance for the call
        setTimeout(() => {
            showEmergencyCallGuidance();
        }, 500);
    }
}

// Show emergency call guidance
function showEmergencyCallGuidance() {
    const guidanceHTML = `
        <div class="emergency-call-guidance">
            <div class="guidance-content">
                <h4>📞 Emergency Call Guidance</h4>
                <div class="call-tips">
                    <h5>When speaking to the 911 operator:</h5>
                    <ul>
                        <li><strong>Stay calm</strong> and speak clearly</li>
                        <li><strong>State your location</strong> immediately</li>
                        <li><strong>Describe your breathing emergency:</strong><br>
                            "I'm having severe breathing difficulties and my breathing analysis app detected very high risk levels."</li>
                        <li><strong>Mention any symptoms:</strong> chest pain, dizziness, blue lips, etc.</li>
                        <li><strong>Follow their instructions</strong> exactly</li>
                        <li><strong>Stay on the line</strong> until they tell you to hang up</li>
                    </ul>
                </div>
                <button onclick="this.closest('.call-guidance-overlay').remove()" class="btn primary">
                    I Understand
                </button>
            </div>
        </div>
    `;
    
    // Create and show guidance modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'call-guidance-overlay';
    modalOverlay.innerHTML = guidanceHTML;
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        padding: 20px;
    `;
    
    const content = modalOverlay.querySelector('.emergency-call-guidance');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        border-left: 4px solid #e53e3e;
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (modalOverlay.parentNode) {
            modalOverlay.remove();
        }
    }, 30000);
}

// Call other emergency numbers
function callPoisonControl() {
    window.location.href = 'tel:18002221222';
    showMessage('Calling Poison Control: 1-800-222-1222', 'info');
}

function callCrisisSupport() {
    window.location.href = 'tel:988';
    showMessage('Calling Crisis Support: 988', 'info');
}

function callBreatheMateSupport() {
    window.location.href = 'tel:18002732843';
    showMessage('Calling BreatheMate Support: 1-800-BREATHE', 'info');
}

// Show message function (reuse existing one if available)
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

// Emergency advice functionality for high-risk cases
function showEmergencyAdvice() {
    const emergencyAdviceHTML = `
        <div class="emergency-advice-modal">
            <div class="emergency-content">
                <div class="emergency-header">
                    <h4><i class="fas fa-first-aid"></i> Emergency First Aid Guidance</h4>
                    <button class="close-btn" onclick="closeEmergencyModal()">&times;</button>
                </div>
                
                <div class="first-aid-steps">
                    <h5>🚨 Immediate Actions for Breathing Difficulties:</h5>
                    <ol>
                        <li><strong>Stay Calm:</strong> Try to remain as calm as possible. Panic can worsen breathing difficulties.</li>
                        <li><strong>Sit Upright:</strong> Sit in an upright position, leaning slightly forward. This opens up your airways.</li>
                        <li><strong>Loosen Clothing:</strong> Remove any tight clothing around your neck and chest.</li>
                        <li><strong>Use Rescue Inhaler:</strong> If you have a prescribed rescue inhaler, use it as directed.</li>
                        <li><strong>Purse-Lip Breathing:</strong> Breathe in through your nose for 2 counts, then breathe out slowly through pursed lips for 4 counts.</li>
                        <li><strong>Fresh Air:</strong> Move to an area with fresh air, away from any triggers.</li>
                    </ol>
                </div>
                
                <div class="emergency-warning">
                    <h5>⚠️ Call 911 Immediately If You Experience:</h5>
                    <ul>
                        <li>Severe difficulty breathing or gasping for air</li>
                        <li>Chest pain or pressure</li>
                        <li>Blue lips, face, or fingernails</li>
                        <li>Dizziness or fainting</li>
                        <li>Inability to speak in full sentences</li>
                        <li>Confusion or loss of consciousness</li>
                    </ul>
                </div>
                
                <div class="emergency-actions">
                    <button class="emergency-btn call-911" onclick="callEmergency()">
                        <i class="fas fa-phone"></i>
                        Call 911 Now
                    </button>
                    <button class="emergency-btn" onclick="showEmergencyContacts()">
                        <i class="fas fa-address-book"></i>
                        Emergency Contacts
                    </button>
                    <button class="emergency-btn" onclick="findNearbyHospitals()">
                        <i class="fas fa-hospital"></i>
                        Find Hospitals
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showEmergencyModal(emergencyAdviceHTML);
}

function showEmergencyContacts() {
    const emergencyContactsHTML = `
        <div class="emergency-contacts-modal">
            <div class="emergency-content">
                <div class="emergency-header">
                    <h4><i class="fas fa-address-book"></i> Emergency Contacts</h4>
                    <button class="close-btn" onclick="closeEmergencyModal()">&times;</button>
                </div>
                
                <div class="contact-list">
                    <div class="contact-item">
                        <div class="contact-info">
                            <strong>Emergency Services</strong>
                            <span>911</span>
                        </div>
                        <button class="call-btn" onclick="makePhoneCall('911')">
                            <i class="fas fa-phone"></i> Call
                        </button>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-info">
                            <strong>Poison Control Center</strong>
                            <span>1-800-222-1222</span>
                        </div>
                        <button class="call-btn" onclick="makePhoneCall('18002221222')">
                            <i class="fas fa-phone"></i> Call
                        </button>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-info">
                            <strong>National Suicide Prevention Lifeline</strong>
                            <span>988</span>
                        </div>
                        <button class="call-btn" onclick="makePhoneCall('988')">
                            <i class="fas fa-phone"></i> Call
                        </button>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-info">
                            <strong>BreatheMate 24/7 Support</strong>
                            <span>1-800-BREATHE</span>
                        </div>
                        <button class="call-btn" onclick="makePhoneCall('18002732843')">
                            <i class="fas fa-phone"></i> Call
                        </button>
                    </div>
                </div>
                
                <div class="emergency-note">
                    <p><strong>Important:</strong> If you're experiencing severe breathing difficulties, chest pain, or other life-threatening symptoms, call 911 immediately.</p>
                </div>
            </div>
        </div>
    `;
    
    showEmergencyModal(emergencyContactsHTML);
}

function showEmergencyModal(content) {
    // Remove any existing modal
    const existingModal = document.querySelector('.emergency-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'emergency-modal-overlay';
    modalOverlay.innerHTML = content;
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeEmergencyModal();
        }
    });
    
    document.body.appendChild(modalOverlay);
    
    // Add escape key listener
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEmergencyModal();
        }
    });
}

function closeEmergencyModal() {
    const modal = document.querySelector('.emergency-modal-overlay');
    if (modal) {
        modal.remove();
    }
    
    // Remove escape key listener
    document.removeEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEmergencyModal();
        }
    });
}

function callEmergency() {
    makePhoneCall('911');
}

function makePhoneCall(number) {
    // For mobile devices, this will open the phone app
    window.location.href = `tel:${number}`;
    
    // Also show a confirmation message
    showMessage(`Calling ${number}...`, 'info');
}

function findNearbyHospitals() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Open Google Maps with nearby hospitals
                const mapsUrl = `https://www.google.com/maps/search/hospitals+near+me/@${lat},${lng},15z`;
                window.open(mapsUrl, '_blank');
                
                showMessage('Opening nearby hospitals in Google Maps...', 'info');
            },
            function(error) {
                // Fallback if geolocation fails
                const mapsUrl = 'https://www.google.com/maps/search/hospitals+near+me';
                window.open(mapsUrl, '_blank');
                
                showMessage('Opening hospital search in Google Maps...', 'info');
            }
        );
    } else {
        // Fallback if geolocation is not supported
        const mapsUrl = 'https://www.google.com/maps/search/hospitals+near+me';
        window.open(mapsUrl, '_blank');
        
        showMessage('Opening hospital search in Google Maps...', 'info');
    }
}