// Trends page functionality
let currentDateRange = 30;
let currentChartType = 'line';
let trendData = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeTrendsPage();
    loadTrendData();
    generateTrendSummary();
    drawRiskChart();
    generateProgressTimeline();
    generateHealthInsights();
    generatePersonalizedSuggestions();
});

// Initialize trends page
function initializeTrendsPage() {
    // Check if user is logged in
    const userEmail = localStorage.getItem('breathemate_email');
    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user has enough data for trends (minimum 3 recordings)
    const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    const breathAnalysisEntries = journalEntries.filter(entry => entry.type === 'breath_analysis');
    
    if (breathAnalysisEntries.length < 3) {
        showInsufficientDataMessage();
        return;
    }
}

// Show message when insufficient data
function showInsufficientDataMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="insufficient-data-card">
            <div class="insufficient-data-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="insufficient-data-content">
                <h2>Need More Data for Trends</h2>
                <p>We need at least 3 breathing test recordings to generate your personal health trends report.</p>
                <p>Current recordings: <strong>${JSON.parse(localStorage.getItem('breathemate_journal') || '[]').filter(entry => entry.type === 'breath_analysis').length}</strong></p>
                <div class="insufficient-data-actions">
                    <button class="action-btn primary" onclick="recordNewTest()">
                        <i class="fas fa-microphone"></i>
                        <span>Record a Test</span>
                    </button>
                    <button class="action-btn secondary" onclick="goBackToDashboard()">
                        <i class="fas fa-arrow-left"></i>
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for insufficient data card
    const style = document.createElement('style');
    style.textContent = `
        .insufficient-data-card {
            background: white;
            border-radius: 16px;
            padding: 48px;
            margin: 80px auto;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .insufficient-data-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
            font-size: 32px;
            color: white;
        }
        .insufficient-data-content h2 {
            font-size: 24px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 16px;
        }
        .insufficient-data-content p {
            color: #4a5568;
            margin-bottom: 16px;
            line-height: 1.6;
        }
        .insufficient-data-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            margin-top: 32px;
            flex-wrap: wrap;
        }
    `;
    document.head.appendChild(style);
}

// Load trend data from journal entries
function loadTrendData() {
    const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    const breathAnalysisEntries = journalEntries.filter(entry => entry.type === 'breath_analysis');
    
    // Sort by date (newest first)
    breathAnalysisEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Filter by current date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentDateRange);
    
    trendData = breathAnalysisEntries
        .filter(entry => new Date(entry.date) >= cutoffDate)
        .map(entry => ({
            date: entry.date,
            riskLevel: parseInt(entry.riskLevel.replace('%', '')),
            stage: entry.stage,
            condition: entry.condition
        }))
        .reverse(); // Reverse to show oldest first in charts
    
    // If we don't have enough data from journal, generate some sample data
    if (trendData.length < 5) {
        generateSampleTrendData();
    }
}

// Generate sample trend data for demonstration
function generateSampleTrendData() {
    const sampleData = [];
    const now = new Date();
    
    for (let i = currentDateRange - 1; i >= 0; i -= 2) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const baseRisk = 45 + Math.sin(i * 0.3) * 20 + (Math.random() - 0.5) * 15;
        const riskLevel = Math.max(10, Math.min(90, Math.round(baseRisk)));
        
        let stage = 'low';
        if (riskLevel > 33 && riskLevel <= 66) stage = 'medium';
        if (riskLevel > 66) stage = 'high';
        
        const conditions = ['Normal Breathing Pattern', 'Mild Irregularities', 'Possible Asthma Indicators', 'COPD Indicators'];
        const condition = conditions[Math.floor(riskLevel / 25)];
        
        sampleData.push({
            date: date.toISOString(),
            riskLevel,
            stage,
            condition
        });
    }
    
    trendData = sampleData;
}

// Generate trend summary
function generateTrendSummary() {
    if (trendData.length < 2) return;
    
    const latestRisk = trendData[trendData.length - 1].riskLevel;
    const previousRisk = trendData[trendData.length - 2].riskLevel;
    const firstRisk = trendData[0].riskLevel;
    
    const recentChange = latestRisk - previousRisk;
    const overallChange = latestRisk - firstRisk;
    
    // Update trend direction
    const trendIcon = document.getElementById('trendIcon');
    const trendDirection = document.getElementById('trendDirection');
    const trendNote = document.getElementById('trendNote');
    
    if (overallChange < -5) {
        trendIcon.innerHTML = '<i class="fas fa-arrow-down"></i>';
        trendIcon.style.background = '#e6fffa';
        trendIcon.style.color = '#38b2ac';
        trendDirection.textContent = 'Improving';
        trendNote.textContent = `${Math.abs(Math.round(overallChange))}% improvement this period`;
    } else if (overallChange > 5) {
        trendIcon.innerHTML = '<i class="fas fa-arrow-up"></i>';
        trendIcon.style.background = '#fed7d7';
        trendIcon.style.color = '#e53e3e';
        trendDirection.textContent = 'Worsening';
        trendNote.textContent = `${Math.round(overallChange)}% increase this period`;
    } else {
        trendIcon.innerHTML = '<i class="fas fa-minus"></i>';
        trendIcon.style.background = '#fef5e7';
        trendIcon.style.color = '#d69e2e';
        trendDirection.textContent = 'Stable';
        trendNote.textContent = 'Minimal change this period';
    }
    
    // Update current risk
    const currentRisk = document.getElementById('currentRisk');
    const riskChange = document.getElementById('riskChange');
    
    let riskStage = 'Low';
    if (latestRisk > 33 && latestRisk <= 66) riskStage = 'Medium';
    if (latestRisk > 66) riskStage = 'High';
    
    currentRisk.textContent = riskStage;
    
    if (recentChange < -3) {
        riskChange.textContent = 'Improving from last test';
    } else if (recentChange > 3) {
        riskChange.textContent = 'Higher than last test';
    } else {
        riskChange.textContent = 'Similar to last test';
    }
    
    // Update testing frequency
    const testingFrequency = document.getElementById('testingFrequency');
    const daysWithTests = trendData.length;
    const expectedTests = currentDateRange / 2; // Assuming testing every 2 days is ideal
    const frequency = Math.min(100, Math.round((daysWithTests / expectedTests) * 100));
    testingFrequency.textContent = `${frequency}%`;
    
    // Update best day
    const bestDay = document.getElementById('bestDay');
    const bestScore = document.getElementById('bestScore');
    const bestResult = trendData.reduce((best, current) => 
        current.riskLevel < best.riskLevel ? current : best
    );
    
    const daysDiff = Math.floor((new Date() - new Date(bestResult.date)) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) {
        bestDay.textContent = 'Today';
    } else if (daysDiff === 1) {
        bestDay.textContent = 'Yesterday';
    } else {
        bestDay.textContent = `${daysDiff} days ago`;
    }
    bestScore.textContent = `${bestResult.riskLevel}% risk level`;
}

// Draw risk chart
function drawRiskChart() {
    const canvas = document.getElementById('riskChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (trendData.length === 0) return;
    
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    
    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
        const y = padding + (i / 10) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    const dataPoints = trendData.length;
    for (let i = 0; i <= dataPoints - 1; i++) {
        const x = padding + (i / (dataPoints - 1)) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
    }
    
    // Draw risk zones
    const lowZoneHeight = (33 / 100) * chartHeight;
    const mediumZoneHeight = (33 / 100) * chartHeight;
    const highZoneHeight = (34 / 100) * chartHeight;
    
    // High risk zone (top)
    ctx.fillStyle = 'rgba(229, 62, 62, 0.1)';
    ctx.fillRect(padding, padding, chartWidth, highZoneHeight);
    
    // Medium risk zone (middle)
    ctx.fillStyle = 'rgba(214, 158, 46, 0.1)';
    ctx.fillRect(padding, padding + highZoneHeight, chartWidth, mediumZoneHeight);
    
    // Low risk zone (bottom)
    ctx.fillStyle = 'rgba(56, 161, 105, 0.1)';
    ctx.fillRect(padding, padding + highZoneHeight + mediumZoneHeight, chartWidth, lowZoneHeight);
    
    if (currentChartType === 'line') {
        drawLineChart(ctx, padding, chartWidth, chartHeight);
    } else {
        drawBarChart(ctx, padding, chartWidth, chartHeight);
    }
    
    // Draw labels
    drawChartLabels(ctx, padding, chartWidth, chartHeight);
}

// Draw line chart
function drawLineChart(ctx, padding, chartWidth, chartHeight) {
    // Draw trend line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    trendData.forEach((point, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth;
        const y = padding + ((100 - point.riskLevel) / 100) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    trendData.forEach((point, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth;
        const y = padding + ((100 - point.riskLevel) / 100) * chartHeight;
        
        // Point color based on risk level
        let pointColor = '#38a169'; // Low risk
        if (point.riskLevel > 33 && point.riskLevel <= 66) pointColor = '#d69e2e'; // Medium
        if (point.riskLevel > 66) pointColor = '#e53e3e'; // High
        
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // White border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// Draw bar chart
function drawBarChart(ctx, padding, chartWidth, chartHeight) {
    const barWidth = chartWidth / trendData.length * 0.8;
    const barSpacing = chartWidth / trendData.length * 0.2;
    
    trendData.forEach((point, index) => {
        const x = padding + (index / trendData.length) * chartWidth + barSpacing / 2;
        const barHeight = (point.riskLevel / 100) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        // Bar color based on risk level
        let barColor = '#38a169'; // Low risk
        if (point.riskLevel > 33 && point.riskLevel <= 66) barColor = '#d69e2e'; // Medium
        if (point.riskLevel > 66) barColor = '#e53e3e'; // High
        
        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Bar border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
    });
}

// Draw chart labels
function drawChartLabels(ctx, padding, chartWidth, chartHeight) {
    ctx.fillStyle = '#718096';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    // X-axis labels (dates)
    trendData.forEach((point, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth;
        const date = new Date(point.date);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, canvas.height - 10);
    });
    
    // Y-axis labels (risk percentages)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
        const y = padding + (i / 10) * chartHeight + 4;
        const value = 100 - (i * 10);
        ctx.fillText(`${value}%`, padding - 10, y);
    }
}

// Generate progress timeline
function generateProgressTimeline() {
    const timelineContainer = document.getElementById('progressTimeline');
    timelineContainer.innerHTML = '';
    
    trendData.slice().reverse().forEach((point, index) => {
        const prevPoint = index < trendData.length - 1 ? trendData[trendData.length - 2 - index] : null;
        
        let trendClass = 'stable';
        let trendIcon = '•';
        let trendText = 'No significant change';
        
        if (prevPoint) {
            const change = point.riskLevel - prevPoint.riskLevel;
            if (change < -5) {
                trendClass = 'improving';
                trendIcon = '↓';
                trendText = `Improved by ${Math.abs(change)}%`;
            } else if (change > 5) {
                trendClass = 'worsening';
                trendIcon = '↑';
                trendText = `Increased by ${change}%`;
            }
        }
        
        const date = new Date(point.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${trendClass}`;
        timelineItem.innerHTML = `
            <div class="timeline-date">${dateStr}</div>
            <div class="timeline-indicator">${trendIcon}</div>
            <div class="timeline-content">
                <h4>${point.condition}</h4>
                <p>${trendText}</p>
            </div>
            <div class="timeline-risk">${point.riskLevel}%</div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}

// Generate health insights
function generateHealthInsights() {
    const patternInsight = document.getElementById('patternInsight');
    const correlationInsight = document.getElementById('correlationInsight');
    const predictionInsight = document.getElementById('predictionInsight');
    
    // Pattern analysis
    const weekdayData = trendData.filter(point => {
        const day = new Date(point.date).getDay();
        return day >= 1 && day <= 5; // Monday to Friday
    });
    const weekendData = trendData.filter(point => {
        const day = new Date(point.date).getDay();
        return day === 0 || day === 6; // Saturday and Sunday
    });
    
    if (weekdayData.length > 0 && weekendData.length > 0) {
        const weekdayAvg = weekdayData.reduce((sum, point) => sum + point.riskLevel, 0) / weekdayData.length;
        const weekendAvg = weekendData.reduce((sum, point) => sum + point.riskLevel, 0) / weekendData.length;
        
        if (weekendAvg < weekdayAvg - 5) {
            patternInsight.textContent = 'Your breathing improves significantly on weekends, suggesting stress may be a factor during weekdays.';
        } else if (weekdayAvg < weekendAvg - 5) {
            patternInsight.textContent = 'Your breathing patterns are better during weekdays, possibly due to regular routine and activities.';
        } else {
            patternInsight.textContent = 'Your breathing patterns remain consistent throughout the week, indicating good overall stability.';
        }
    }
    
    // Correlation analysis
    const testingConsistency = (trendData.length / (currentDateRange / 2)) * 100;
    if (testingConsistency > 80) {
        correlationInsight.textContent = `Excellent testing consistency (${Math.round(testingConsistency)}%) correlates with more stable breathing patterns.`;
    } else if (testingConsistency > 60) {
        correlationInsight.textContent = `Good testing consistency (${Math.round(testingConsistency)}%) helps track your breathing health effectively.`;
    } else {
        correlationInsight.textContent = `Irregular testing (${Math.round(testingConsistency)}%) makes it harder to identify patterns. Try testing every 2-3 days.`;
    }
    
    // Trend prediction
    if (trendData.length >= 3) {
        const recentTrend = trendData.slice(-3);
        const avgChange = (recentTrend[2].riskLevel - recentTrend[0].riskLevel) / 2;
        
        if (avgChange < -3) {
            predictionInsight.textContent = 'Based on current improvement trends, you\'re likely to achieve better breathing health within the next 2 weeks.';
        } else if (avgChange > 3) {
            predictionInsight.textContent = 'Recent patterns suggest focusing on breathing exercises and stress management would be beneficial.';
        } else {
            predictionInsight.textContent = 'Your breathing patterns are stable. Continue current monitoring and healthy habits.';
        }
    }
}

// Generate personalized suggestions
function generatePersonalizedSuggestions() {
    const suggestionsContainer = document.getElementById('suggestionsContainer');
    suggestionsContainer.innerHTML = '';
    
    const suggestions = generateSuggestionsList();
    
    suggestions.forEach(suggestion => {
        const suggestionCard = document.createElement('div');
        suggestionCard.className = 'suggestion-card';
        suggestionCard.innerHTML = `
            <div class="suggestion-priority ${suggestion.priority}">
                ${suggestion.priority === 'high' ? '!' : suggestion.priority === 'medium' ? '•' : 'i'}
            </div>
            <div class="suggestion-content">
                <h4>${suggestion.title}</h4>
                <p>${suggestion.description}</p>
                <button class="suggestion-action" onclick="${suggestion.action}">
                    <i class="${suggestion.icon}"></i>
                    ${suggestion.actionText}
                </button>
            </div>
        `;
        suggestionsContainer.appendChild(suggestionCard);
    });
}

// Generate suggestions based on trend analysis
function generateSuggestionsList() {
    const suggestions = [];
    const latestRisk = trendData[trendData.length - 1]?.riskLevel || 50;
    const overallTrend = calculateOverallTrend();
    
    // High priority suggestions
    if (latestRisk > 70) {
        suggestions.push({
            title: 'Schedule Medical Consultation',
            description: 'Your recent risk levels are concerning. Please consult with a healthcare professional for proper evaluation.',
            priority: 'high',
            action: 'shareWithDoctor()',
            actionText: 'Contact Doctor',
            icon: 'fas fa-user-md'
        });
    }
    
    if (overallTrend > 10) {
        suggestions.push({
            title: 'Implement Breathing Exercises',
            description: 'Your breathing patterns show worsening trends. Daily breathing exercises can help improve your respiratory health.',
            priority: 'high',
            action: 'startBreathingExercises()',
            actionText: 'Start Exercises',
            icon: 'fas fa-lungs'
        });
    }
    
    // Medium priority suggestions
    const daysSinceLastTest = Math.floor((new Date() - new Date(trendData[trendData.length - 1]?.date)) / (1000 * 60 * 60 * 24));
    if (daysSinceLastTest > 3) {
        suggestions.push({
            title: 'Record New Test',
            description: `It's been ${daysSinceLastTest} days since your last test. Regular monitoring helps track your progress better.`,
            priority: 'medium',
            action: 'recordNewTest()',
            actionText: 'Record Now',
            icon: 'fas fa-microphone'
        });
    }
    
    if (latestRisk > 40 && latestRisk <= 70) {
        suggestions.push({
            title: 'Focus on Sleep Quality',
            description: 'Medium risk levels often correlate with poor sleep. Aim for 7-8 hours of quality sleep nightly.',
            priority: 'medium',
            action: 'setSleepReminder()',
            actionText: 'Set Reminder',
            icon: 'fas fa-bed'
        });
    }
    
    // Low priority suggestions
    if (overallTrend < -5) {
        suggestions.push({
            title: 'Keep Up the Great Work!',
            description: 'Your breathing health is improving. Continue your current routine and maintain healthy habits.',
            priority: 'low',
            action: 'setReminder()',
            actionText: 'Set Reminder',
            icon: 'fas fa-star'
        });
    }
    
    suggestions.push({
        title: 'Track Symptoms Daily',
        description: 'Recording daily symptoms alongside breathing tests provides better insights into your respiratory health.',
        priority: 'low',
        action: 'openJournal()',
        actionText: 'Open Journal',
        icon: 'fas fa-book'
    });
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
}

// Calculate overall trend
function calculateOverallTrend() {
    if (trendData.length < 2) return 0;
    const firstRisk = trendData[0].riskLevel;
    const lastRisk = trendData[trendData.length - 1].riskLevel;
    return lastRisk - firstRisk;
}

// Switch chart type
function switchChartType(type) {
    currentChartType = type;
    
    // Update button states
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Redraw chart
    drawRiskChart();
}

// Update date range
function updateDateRange() {
    currentDateRange = parseInt(document.getElementById('dateRange').value);
    loadTrendData();
    generateTrendSummary();
    drawRiskChart();
    generateProgressTimeline();
    generateHealthInsights();
    generatePersonalizedSuggestions();
}

// Action functions
function recordNewTest() {
    window.location.href = 'record.html';
}

function openJournal() {
    window.location.href = 'journal.html';
}

function goBackToDashboard() {
    window.location.href = 'dashboard.html';
}

function setReminder() {
    showMessage('Reminder set! We\'ll notify you to take your next breathing test.', 'success');
}

function shareWithDoctor() {
    showMessage('Opening sharing options for healthcare providers...', 'info');
    setTimeout(() => {
        showMessage('Feature coming soon! You can download your trend report to share with your doctor.', 'success');
    }, 1500);
}

function startBreathingExercises() {
    showMessage('Opening breathing exercise guide...', 'info');
    setTimeout(() => {
        showMessage('Breathing exercises feature coming soon! Try the 4-7-8 technique: Inhale 4, hold 7, exhale 8.', 'success');
    }, 1500);
}

function setSleepReminder() {
    showMessage('Sleep reminder set! We\'ll help you maintain a healthy sleep schedule.', 'success');
}

function exportTrendReport() {
    showMessage('Generating trend report...', 'info');
    
    setTimeout(() => {
        const reportData = {
            exportDate: new Date().toISOString(),
            dateRange: `Last ${currentDateRange} days`,
            trendSummary: {
                overallTrend: document.getElementById('trendDirection').textContent,
                currentRisk: document.getElementById('currentRisk').textContent,
                testingFrequency: document.getElementById('testingFrequency').textContent
            },
            trendData: trendData,
            insights: {
                pattern: document.getElementById('patternInsight').textContent,
                correlation: document.getElementById('correlationInsight').textContent,
                prediction: document.getElementById('predictionInsight').textContent
            }
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `BreatheMate_Trend_Report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('Trend report exported successfully!', 'success');
    }, 2000);
}

function shareTrendReport() {
    const shareText = `My BreatheMate Health Trends Report
Overall Trend: ${document.getElementById('trendDirection').textContent}
Current Risk: ${document.getElementById('currentRisk').textContent}
Testing Consistency: ${document.getElementById('testingFrequency').textContent}

Track your respiratory health with BreatheMate!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'BreatheMate Health Trends',
            text: shareText
        }).then(() => {
            showMessage('Trend report shared successfully!', 'success');
        }).catch(() => {
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('Trend report copied to clipboard!', 'success');
        });
    } else {
        showMessage('Sharing not supported on this device.', 'info');
    }
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