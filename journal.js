// Breathing Journal functionality
let allEntries = [];
let filteredEntries = [];
let currentEditingEntry = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeJournal();
    loadJournalEntries();
    updateStatistics();
    renderEntries();
    setupModalHandlers();
});

// Initialize journal page
function initializeJournal() {
    // Check if user is logged in
    const userEmail = localStorage.getItem('breathemate_email');
    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set current date/time for new entry form
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    document.getElementById('entryDate').value = localDateTime;
}

// Load journal entries from localStorage
function loadJournalEntries() {
    const savedEntries = localStorage.getItem('breathemate_journal');
    
    if (savedEntries) {
        allEntries = JSON.parse(savedEntries);
    } else {
        // Generate some sample entries for demo
        allEntries = generateSampleEntries();
        localStorage.setItem('breathemate_journal', JSON.stringify(allEntries));
    }
    
    filteredEntries = [...allEntries];
    sortEntriesByDate();
}

// Generate sample journal entries for demo
function generateSampleEntries() {
    const sampleEntries = [];
    const now = new Date();
    
    // Add some recent breath analysis entries
    for (let i = 0; i < 5; i++) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const risks = ['low', 'medium', 'high'];
        const conditions = [
            'Normal Breathing Pattern',
            'Possible Asthma Indicators', 
            'Mild Breathing Irregularities',
            'COPD Indicators Detected'
        ];
        
        const risk = risks[Math.floor(Math.random() * risks.length)];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        sampleEntries.push({
            id: `entry_${Date.now()}_${i}`,
            date: date.toISOString(),
            type: 'breath_analysis',
            riskLevel: risk === 'low' ? '25%' : risk === 'medium' ? '65%' : '85%',
            condition: condition,
            stage: risk,
            notes: 'Automated analysis from BreatheMate',
            symptoms: [],
            severity: risk,
            triggers: ''
        });
    }
    
    // Add some manual symptom entries
    const symptoms = [
        'shortness_of_breath',
        'wheezing', 
        'chest_tightness',
        'coughing',
        'fatigue'
    ];
    
    for (let i = 0; i < 3; i++) {
        const date = new Date(now.getTime() - ((i + 2) * 24 * 60 * 60 * 1000));
        const selectedSymptoms = symptoms.slice(0, Math.floor(Math.random() * 3) + 1);
        
        sampleEntries.push({
            id: `entry_${Date.now()}_manual_${i}`,
            date: date.toISOString(),
            type: 'symptoms',
            symptoms: selectedSymptoms,
            severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
            triggers: 'Exercise, cold air',
            notes: 'Experienced symptoms after morning jog in cold weather',
            riskLevel: null,
            condition: null,
            stage: null
        });
    }
    
    return sampleEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Update statistics
function updateStatistics() {
    const totalEntries = allEntries.length;
    document.getElementById('totalEntries').textContent = totalEntries;
    
    // Calculate average risk for breath analysis entries
    const breathAnalysisEntries = allEntries.filter(entry => entry.type === 'breath_analysis' && entry.riskLevel);
    if (breathAnalysisEntries.length > 0) {
        const avgRisk = breathAnalysisEntries.reduce((sum, entry) => {
            return sum + parseInt(entry.riskLevel.replace('%', ''));
        }, 0) / breathAnalysisEntries.length;
        document.getElementById('averageRisk').textContent = `${Math.round(avgRisk)}%`;
    } else {
        document.getElementById('averageRisk').textContent = '-';
    }
    
    // Calculate current streak (consecutive days with entries)
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const hasEntry = allEntries.some(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.toDateString() === checkDate.toDateString();
        });
        
        if (hasEntry) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    document.getElementById('currentStreak').textContent = `${streak} days`;
    
    // Count high risk days
    const highRiskDays = allEntries.filter(entry => entry.stage === 'high').length;
    document.getElementById('highRiskDays').textContent = highRiskDays;
}

// Render journal entries
function renderEntries() {
    const container = document.getElementById('entriesContainer');
    const emptyState = document.getElementById('emptyState');
    const entryCount = document.getElementById('entryCount');
    
    if (filteredEntries.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        entryCount.textContent = '0 entries';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    entryCount.textContent = `${filteredEntries.length} entries`;
    
    container.innerHTML = filteredEntries.map(entry => createEntryCard(entry)).join('');
}

// Create entry card HTML
function createEntryCard(entry) {
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let riskCircle = '';
    let entryTitle = '';
    let entrySummary = '';
    let entryTags = '';
    
    if (entry.type === 'breath_analysis') {
        entryTitle = entry.condition || 'Breathing Analysis';
        entrySummary = `Risk Level: ${entry.riskLevel}`;
        riskCircle = `
            <div class="entry-risk">
                <div class="risk-circle-small ${entry.stage}">
                    ${entry.riskLevel}
                </div>
                <span class="risk-label-small">${entry.stage}</span>
            </div>
        `;
    } else if (entry.type === 'symptoms') {
        entryTitle = 'Symptom Entry';
        entrySummary = `Severity: ${entry.severity} • ${entry.symptoms.length} symptoms`;
        entryTags = entry.symptoms.map(symptom => 
            `<span class="entry-tag">${symptom.replace('_', ' ')}</span>`
        ).join('');
    } else {
        entryTitle = 'Manual Entry';
        entrySummary = entry.notes ? entry.notes.substring(0, 50) + '...' : 'No notes';
    }
    
    return `
        <div class="entry-card" onclick="openEntryDetail('${entry.id}')">
            <div class="entry-header">
                <div>
                    <div class="entry-date">${formattedDate}</div>
                    <div class="entry-time">${formattedTime}</div>
                </div>
                <span class="entry-type ${entry.type}">${entry.type.replace('_', ' ')}</span>
            </div>
            <div class="entry-content">
                ${riskCircle}
                <div class="entry-details">
                    <h4 class="entry-title">${entryTitle}</h4>
                    <p class="entry-summary">${entrySummary}</p>
                    <div class="entry-tags">${entryTags}</div>
                </div>
            </div>
        </div>
    `;
}

// Apply filters
function applyFilters() {
    const riskFilter = document.getElementById('riskFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    filteredEntries = allEntries.filter(entry => {
        // Risk filter
        if (riskFilter !== 'all' && entry.stage !== riskFilter) {
            return false;
        }
        
        // Date filter
        if (dateFilter !== 'all') {
            const entryDate = new Date(entry.date);
            const now = new Date();
            const daysDiff = Math.floor((now - entryDate) / (1000 * 60 * 60 * 24));
            
            if (dateFilter === 'week' && daysDiff > 7) return false;
            if (dateFilter === 'month' && daysDiff > 30) return false;
            if (dateFilter === '3months' && daysDiff > 90) return false;
        }
        
        // Type filter
        if (typeFilter !== 'all' && entry.type !== typeFilter) {
            return false;
        }
        
        return true;
    });
    
    renderEntries();
}

// Clear all filters
function clearFilters() {
    document.getElementById('riskFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    
    filteredEntries = [...allEntries];
    renderEntries();
}

// Search entries
function searchEntries() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        applyFilters();
        return;
    }
    
    filteredEntries = allEntries.filter(entry => {
        const searchableText = [
            entry.condition,
            entry.notes,
            entry.triggers,
            ...(entry.symptoms || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
    });
    
    renderEntries();
}

// Sort entries by date (newest first)
function sortEntriesByDate() {
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Modal handlers
function setupModalHandlers() {
    const addEntryForm = document.getElementById('addEntryForm');
    addEntryForm.addEventListener('submit', handleAddEntry);
    
    // Close modals when clicking overlay
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddEntryModal();
        }
    });
    
    document.getElementById('detailModalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDetailModal();
        }
    });
}

// Open add entry modal
function openAddEntryModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Reset form
    document.getElementById('addEntryForm').reset();
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    document.getElementById('entryDate').value = localDateTime;
}

// Close add entry modal
function closeAddEntryModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEditingEntry = null;
}

// Handle add entry form submission
function handleAddEntry(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const selectedSymptoms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    const newEntry = {
        id: currentEditingEntry ? currentEditingEntry.id : `entry_${Date.now()}`,
        date: document.getElementById('entryDate').value,
        type: document.getElementById('entryType').value,
        symptoms: selectedSymptoms,
        severity: document.getElementById('severity').value,
        triggers: document.getElementById('triggers').value,
        notes: document.getElementById('entryNotes').value,
        riskLevel: null,
        condition: null,
        stage: selectedSymptoms.length > 2 ? 'medium' : 'low'
    };
    
    if (currentEditingEntry) {
        // Update existing entry
        const index = allEntries.findIndex(entry => entry.id === currentEditingEntry.id);
        if (index !== -1) {
            allEntries[index] = newEntry;
        }
    } else {
        // Add new entry
        allEntries.unshift(newEntry);
    }
    
    // Save to localStorage
    localStorage.setItem('breathemate_journal', JSON.stringify(allEntries));
    
    // Update UI
    filteredEntries = [...allEntries];
    sortEntriesByDate();
    updateStatistics();
    renderEntries();
    closeAddEntryModal();
    
    showMessage(currentEditingEntry ? 'Entry updated successfully!' : 'Entry added successfully!', 'success');
}

// Open entry detail modal
function openEntryDetail(entryId) {
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const modal = document.getElementById('detailModalOverlay');
    const content = document.getElementById('detailModalContent');
    
    const date = new Date(entry.date);
    const formattedDateTime = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let detailHTML = `
        <div class="entry-detail">
            <div class="detail-header">
                <h4>${formattedDateTime}</h4>
                <span class="entry-type ${entry.type}">${entry.type.replace('_', ' ')}</span>
            </div>
    `;
    
    if (entry.type === 'breath_analysis') {
        detailHTML += `
            <div class="detail-section">
                <h5>Analysis Results</h5>
                <p><strong>Detected Condition:</strong> ${entry.condition}</p>
                <p><strong>Risk Level:</strong> ${entry.riskLevel}</p>
                <p><strong>Risk Stage:</strong> <span class="risk-badge ${entry.stage}">${entry.stage}</span></p>
            </div>
        `;
    } else {
        if (entry.symptoms && entry.symptoms.length > 0) {
            detailHTML += `
                <div class="detail-section">
                    <h5>Symptoms</h5>
                    <div class="symptoms-list">
                        ${entry.symptoms.map(symptom => 
                            `<span class="symptom-tag">${symptom.replace('_', ' ')}</span>`
                        ).join('')}
                    </div>
                    <p><strong>Severity:</strong> ${entry.severity}</p>
                </div>
            `;
        }
        
        if (entry.triggers) {
            detailHTML += `
                <div class="detail-section">
                    <h5>Triggers</h5>
                    <p>${entry.triggers}</p>
                </div>
            `;
        }
    }
    
    if (entry.notes) {
        detailHTML += `
            <div class="detail-section">
                <h5>Notes</h5>
                <p>${entry.notes}</p>
            </div>
        `;
    }
    
    detailHTML += '</div>';
    
    // Add some CSS for the detail view
    detailHTML += `
        <style>
            .entry-detail { }
            .detail-header { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin-bottom: 20px; 
                padding-bottom: 16px;
                border-bottom: 1px solid #e2e8f0;
            }
            .detail-section { 
                margin-bottom: 20px; 
            }
            .detail-section h5 { 
                font-size: 14px; 
                font-weight: 600; 
                color: #4a5568; 
                margin-bottom: 8px; 
            }
            .symptoms-list { 
                display: flex; 
                gap: 8px; 
                flex-wrap: wrap; 
                margin-bottom: 12px; 
            }
            .symptom-tag { 
                background: #e0e7ff; 
                color: #667eea; 
                padding: 4px 12px; 
                border-radius: 12px; 
                font-size: 12px; 
                font-weight: 500; 
            }
            .risk-badge { 
                padding: 4px 12px; 
                border-radius: 12px; 
                font-size: 12px; 
                font-weight: 600; 
                text-transform: uppercase; 
            }
            .risk-badge.low { 
                background: #c6f6d5; 
                color: #2f855a; 
            }
            .risk-badge.medium { 
                background: #fed7d7; 
                color: #c53030; 
            }
            .risk-badge.high { 
                background: #feb2b2; 
                color: #e53e3e; 
            }
        </style>
    `;
    
    content.innerHTML = detailHTML;
    
    // Set up edit button
    const editBtn = document.getElementById('editEntryBtn');
    if (entry.type !== 'breath_analysis') {
        editBtn.style.display = 'flex';
        editBtn.onclick = () => editEntry(entryId);
    } else {
        editBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('detailModalOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Edit entry
function editEntry(entryId) {
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry || entry.type === 'breath_analysis') return;
    
    currentEditingEntry = entry;
    
    // Close detail modal
    closeDetailModal();
    
    // Open add entry modal with pre-filled data
    openAddEntryModal();
    
    // Fill form with existing data
    document.getElementById('entryDate').value = entry.date.slice(0, 16);
    document.getElementById('entryType').value = entry.type;
    document.getElementById('severity').value = entry.severity || 'mild';
    document.getElementById('triggers').value = entry.triggers || '';
    document.getElementById('entryNotes').value = entry.notes || '';
    
    // Check symptoms
    if (entry.symptoms) {
        entry.symptoms.forEach(symptom => {
            const checkbox = document.querySelector(`input[value="${symptom}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Update modal title
    document.querySelector('#modalOverlay .modal-header h3').textContent = 'Edit Entry';
}

// Export journal data
function exportJournal() {
    const journalData = {
        exportDate: new Date().toISOString(),
        totalEntries: allEntries.length,
        entries: allEntries
    };
    
    const dataStr = JSON.stringify(journalData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `BreatheMate_Journal_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Journal exported successfully!', 'success');
}

// Navigation functions
function goBackToDashboard() {
    window.location.href = 'dashboard.html';
}

function goToRecord() {
    window.location.href = 'record.html';
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