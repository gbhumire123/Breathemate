// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadUserData();
    updateStatusCards();
    initializeDailyReminderSystem();
    initializeMultiProfileDashboard();
});

// Initialize dashboard
function initializeDashboard() {
    // Check if user is logged in
    const userEmail = localStorage.getItem('breathemate_email');
    if (!userEmail) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    // Load user name from localStorage or use default
    const userName = localStorage.getItem('breathemate_username') || 'Demo User';
    document.getElementById('userName').textContent = userName;
    document.getElementById('profileName').textContent = userName;
    
    // Add click handlers for closing dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.profile-dropdown')) {
            closeProfileMenu();
        }
        if (!event.target.closest('.notification-btn') && !event.target.closest('.notification-panel')) {
            closeNotifications();
        }
    });
}

// Load user data
function loadUserData() {
    // Simulate loading user data from backend
    const userData = {
        name: localStorage.getItem('breathemate_username') || 'Demo User',
        email: localStorage.getItem('breathemate_email') || 'demo@breathemate.com',
        lastScan: localStorage.getItem('breathemate_last_scan') || null,
        riskLevel: localStorage.getItem('breathemate_risk_level') || 'No scan yet',
        dailyStreak: parseInt(localStorage.getItem('breathemate_daily_streak')) || 0
    };
    
    // Update UI with user data
    updateUserInterface(userData);
}

// Update user interface with data
function updateUserInterface(userData) {
    // Update risk status
    const riskElement = document.getElementById('riskStatus');
    const riskCard = document.querySelector('.risk-status');
    
    if (userData.riskLevel === 'No scan yet') {
        riskElement.textContent = 'No scan yet';
        riskCard.querySelector('.status-note').textContent = 'Take your first breath test';
    } else {
        riskElement.textContent = userData.riskLevel;
        riskCard.querySelector('.status-note').textContent = 'Based on latest analysis';
    }
    
    // Update last scan
    const scanElement = document.getElementById('lastScan');
    const scanCard = document.querySelector('.scan-status');
    
    if (userData.lastScan) {
        scanElement.textContent = formatDate(userData.lastScan);
        scanCard.querySelector('.status-note').textContent = 'Last breathing analysis';
    } else {
        scanElement.textContent = 'Not available';
        scanCard.querySelector('.status-note').textContent = 'Record your first breath test';
    }
    
    // Update daily streak
    const streakElement = document.getElementById('dailyStreak');
    const streakCard = document.querySelector('.streak-status');
    
    streakElement.textContent = `${userData.dailyStreak} days`;
    if (userData.dailyStreak === 0) {
        streakCard.querySelector('.status-note').textContent = 'Start your health journey';
    } else {
        streakCard.querySelector('.status-note').textContent = 'Keep up the great work!';
    }
}

// Update status cards with animations
function updateStatusCards() {
    const cards = document.querySelectorAll('.status-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
}

// Profile menu toggle
function toggleProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    const overlay = document.getElementById('overlay');
    
    profileMenu.classList.toggle('active');
    
    if (profileMenu.classList.contains('active')) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Close profile menu
function closeProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    const overlay = document.getElementById('overlay');
    
    profileMenu.classList.remove('active');
    overlay.classList.remove('active');
}

// Notification panel toggle
function toggleNotifications() {
    const notificationPanel = document.getElementById('notificationPanel');
    const overlay = document.getElementById('overlay');
    
    notificationPanel.classList.toggle('active');
    
    if (notificationPanel.classList.contains('active')) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Close notifications
function closeNotifications() {
    const notificationPanel = document.getElementById('notificationPanel');
    const overlay = document.getElementById('overlay');
    
    notificationPanel.classList.remove('active');
    overlay.classList.remove('active');
}

// Close all dropdowns
function closeAllDropdowns() {
    closeProfileMenu();
    closeNotifications();
}

// Main action functions
function recordBreath() {
    // Navigate to the Record & Analyze page
    window.location.href = 'record.html';
}

function viewReport() {
    const lastScan = localStorage.getItem('breathemate_last_scan');
    
    if (!lastScan) {
        showMessage('No reports available yet. Please record your first breath test.', 'warning');
        return;
    }
    
    // Navigate to results page
    window.location.href = 'results.html';
}

function openJournal() {
    // Navigate to journal page
    window.location.href = 'journal.html';
}

function viewTrends() {
    // Check if user has enough data for trends
    const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    const breathAnalysisEntries = journalEntries.filter(entry => entry.type === 'breath_analysis');
    
    if (breathAnalysisEntries.length < 3) {
        showMessage('You need at least 3 breathing test recordings to view health trends. Record more tests first!', 'warning');
        return;
    }
    
    // Navigate to trends page
    window.location.href = 'trends.html';
}

function openSettings() {
    // Navigate to settings page
    window.location.href = 'settings.html';
}

function openProfile() {
    closeProfileMenu();
    
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const settings = JSON.parse(localStorage.getItem('breathemate_settings') || '{}');
    
    if (settings.caregiverMode && profiles.length > 1) {
        showMessage('Opening profile management...', 'info');
        setTimeout(() => {
            window.location.href = 'settings.html';
        }, 1000);
    } else {
        showMessage('Opening profile management...', 'info');
        setTimeout(() => {
            showMessage('Profile management coming soon! Update your account information.', 'success');
        }, 1500);
    }
}

function logout() {
    closeProfileMenu();
    
    // Clear user data
    localStorage.removeItem('breathemate_email');
    localStorage.removeItem('breathemate_username');
    localStorage.removeItem('breathemate_remember');
    
    showMessage('Logging out...', 'info');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Initialize daily reminder system on dashboard load
function initializeDailyReminderSystem() {
    const settings = JSON.parse(localStorage.getItem('breathemate_settings') || '{}');
    
    if (settings.notifications?.dailyReminders && 'Notification' in window) {
        // Check if notifications are already granted
        if (Notification.permission === 'granted') {
            scheduleDailyReminderFromDashboard(settings.notifications.dailyReminderTime || '09:00');
        } else if (Notification.permission === 'default') {
            // Don't auto-request permission on dashboard, let user do it in settings
            console.log('Daily reminders enabled but notification permission not granted. User can enable in settings.');
        }
    }
}

// Schedule daily reminder from dashboard (simplified version)
function scheduleDailyReminderFromDashboard(reminderTime) {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    function scheduleNext() {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // If the time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const msUntilReminder = scheduledTime.getTime() - now.getTime();
        
        setTimeout(() => {
            sendDashboardDailyReminder();
            scheduleNext(); // Schedule next day
        }, msUntilReminder);
        
        console.log(`Daily reminder scheduled from dashboard for ${scheduledTime.toLocaleString()}`);
    }
    
    scheduleNext();
}

// Send daily reminder from dashboard
function sendDashboardDailyReminder() {
    if (Notification.permission !== 'granted') return;
    
    // Check if user already tested today
    const today = new Date().toDateString();
    const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    const todaysTests = journalEntries.filter(entry => {
        const entryDate = new Date(entry.date).toDateString();
        return entryDate === today && entry.type === 'breath_analysis';
    });
    
    if (todaysTests.length > 0) {
        const notification = new Notification('BreatheMate - Great job! 🌟', {
            body: 'You\'ve already completed your breathing test today. Keep up the great work!',
            icon: '/favicon.ico',
            tag: 'breathemate-daily-complete'
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        return;
    }
    
    // Send reminder
    const notification = new Notification('BreatheMate - Daily Reminder 🫁', {
        body: 'Time for your daily breathing test! Track your lung health in just 30 seconds.',
        icon: '/favicon.ico',
        tag: 'breathemate-daily-reminder',
        requireInteraction: true
    });
    
    notification.onclick = function() {
        window.focus();
        window.location.href = 'record.html';
        notification.close();
    };
    
    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
}

// Initialize multi-profile dashboard features
function initializeMultiProfileDashboard() {
    loadProfileSystem();
    updateProfileSwitcherVisibility();
    loadActiveProfile();
}

// Load profile system data
function loadProfileSystem() {
    const profiles = localStorage.getItem('breathemate_user_profiles');
    const settings = JSON.parse(localStorage.getItem('breathemate_settings') || '{}');
    
    if (profiles) {
        const userProfiles = JSON.parse(profiles);
        const caregiverMode = settings.caregiverMode || false;
        
        // Show profile switcher if caregiver mode is enabled and there are multiple profiles
        if (caregiverMode && userProfiles.length > 1) {
            updateProfileSwitcherDisplay(userProfiles);
        }
    }
}

// Update profile switcher visibility and content
function updateProfileSwitcherDisplay(profiles) {
    const profileSwitcherHeader = document.getElementById('profileSwitcherHeader');
    const activeProfileId = localStorage.getItem('breathemate_active_profile');
    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
    
    if (profileSwitcherHeader && profiles.length > 1) {
        profileSwitcherHeader.style.display = 'block';
        
        // Update current profile display
        const currentProfileAvatar = document.getElementById('currentProfileAvatar');
        const currentProfileName = document.getElementById('currentProfileName');
        const profileCount = document.getElementById('profileCount');
        
        if (currentProfileAvatar && activeProfile) {
            currentProfileAvatar.style.background = activeProfile.avatar;
            currentProfileAvatar.textContent = activeProfile.name.charAt(0).toUpperCase();
        }
        
        if (currentProfileName && activeProfile) {
            currentProfileName.textContent = activeProfile.name;
        }
        
        if (profileCount) {
            profileCount.textContent = `${profiles.length} profiles`;
        }
    }
}

// Update profile switcher visibility based on caregiver mode
function updateProfileSwitcherVisibility() {
    const settings = JSON.parse(localStorage.getItem('breathemate_settings') || '{}');
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const profileSwitcherHeader = document.getElementById('profileSwitcherHeader');
    
    if (profileSwitcherHeader) {
        const shouldShow = settings.caregiverMode && profiles.length > 1;
        profileSwitcherHeader.style.display = shouldShow ? 'block' : 'none';
    }
}

// Load active profile data
function loadActiveProfile() {
    const activeProfileId = localStorage.getItem('breathemate_active_profile');
    if (activeProfileId) {
        const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
        const activeProfile = profiles.find(p => p.id === activeProfileId);
        
        if (activeProfile) {
            // Update dashboard with active profile data
            document.getElementById('userName').textContent = activeProfile.name;
            document.getElementById('profileName').textContent = activeProfile.name;
            
            // Load profile-specific journal data
            if (activeProfile.journalEntries) {
                localStorage.setItem('breathemate_journal', JSON.stringify(activeProfile.journalEntries));
            }
        }
    }
}

// Open quick profile switcher modal
function openQuickProfileSwitcher() {
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const activeProfileId = localStorage.getItem('breathemate_active_profile');
    
    const modal = createQuickProfileSwitcherModal(profiles, activeProfileId);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
}

// Create quick profile switcher modal
function createQuickProfileSwitcherModal(profiles, activeProfileId) {
    const modal = document.createElement('div');
    modal.className = 'quick-profile-switcher';
    modal.onclick = (e) => {
        if (e.target === modal) closeQuickProfileSwitcher();
    };
    
    modal.innerHTML = `
        <div class="quick-switcher-content">
            <div class="quick-switcher-header">
                <h3>Switch Profile</h3>
                <p>Select which user you'd like to view</p>
            </div>
            
            <div class="quick-profiles-grid">
                ${profiles.map(profile => {
                    const isActive = profile.id === activeProfileId;
                    const journalCount = profile.journalEntries?.length || 0;
                    
                    return `
                        <div class="quick-profile-card ${isActive ? 'active' : ''}" onclick="quickSwitchToProfile('${profile.id}')">
                            <div class="quick-profile-avatar" style="background: ${profile.avatar}">
                                ${profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="quick-profile-info">
                                <h4>${profile.name}</h4>
                                <p>${profile.relationship === 'self' ? 'Primary Account' : capitalizeFirst(profile.relationship)} • ${journalCount} entries</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="form-actions">
                <button class="btn secondary" onclick="closeQuickProfileSwitcher()">Cancel</button>
                <button class="btn primary" onclick="openSettings(); closeQuickProfileSwitcher();">Manage Profiles</button>
            </div>
        </div>
    `;
    
    return modal;
}

// Quick switch to profile
function quickSwitchToProfile(profileId) {
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const profile = profiles.find(p => p.id === profileId);
    
    if (!profile) return;
    
    // Save current profile data before switching
    saveCurrentProfileDataDashboard();
    
    // Switch to new profile
    localStorage.setItem('breathemate_active_profile', profileId);
    
    // Load new profile data
    loadProfileDataDashboard(profile);
    
    // Close modal and refresh
    closeQuickProfileSwitcher();
    showMessage(`Switched to ${profile.name}'s profile`, 'success');
    
    // Refresh the page to apply all changes
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Save current profile data from dashboard
function saveCurrentProfileDataDashboard() {
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const activeProfileId = localStorage.getItem('breathemate_active_profile');
    const currentProfile = profiles.find(p => p.id === activeProfileId);
    
    if (currentProfile) {
        // Save current journal entries
        const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
        currentProfile.journalEntries = journalEntries;
        
        // Save updated profiles
        localStorage.setItem('breathemate_user_profiles', JSON.stringify(profiles));
    }
}

// Load profile data for dashboard
function loadProfileDataDashboard(profile) {
    // Load profile's journal entries
    localStorage.setItem('breathemate_journal', JSON.stringify(profile.journalEntries || []));
    
    // Update user info
    localStorage.setItem('breathemate_username', profile.name);
    localStorage.setItem('breathemate_email', profile.email);
    
    // Update last scan and risk level based on profile's data
    if (profile.journalEntries && profile.journalEntries.length > 0) {
        const latestEntry = profile.journalEntries[0];
        if (latestEntry.type === 'breath_analysis') {
            localStorage.setItem('breathemate_last_scan', latestEntry.date);
            localStorage.setItem('breathemate_risk_level', latestEntry.riskLevel || 'Low Risk');
        }
    } else {
        localStorage.removeItem('breathemate_last_scan');
        localStorage.setItem('breathemate_risk_level', 'No scan yet');
    }
}

// Close quick profile switcher
function closeQuickProfileSwitcher() {
    const modal = document.querySelector('.quick-profile-switcher');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Enhanced openProfile function for multi-profile support
function openProfile() {
    closeProfileMenu();
    
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const settings = JSON.parse(localStorage.getItem('breathemate_settings') || '{}');
    
    if (settings.caregiverMode && profiles.length > 1) {
        showMessage('Opening profile management...', 'info');
        setTimeout(() => {
            window.location.href = 'settings.html';
        }, 1000);
    } else {
        showMessage('Opening profile management...', 'info');
        setTimeout(() => {
            showMessage('Profile management coming soon! Update your account information.', 'success');
        }, 1500);
    }
}

// Update time-sensitive content every minute
setInterval(() => {
    const lastScanElement = document.getElementById('lastScan');
    const lastScan = localStorage.getItem('breathemate_last_scan');
    
    if (lastScan && lastScanElement) {
        lastScanElement.textContent = formatDate(lastScan);
    }
}, 60000);

// Add welcome animation on page load
window.addEventListener('load', function() {
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.style.opacity = '0';
        welcomeSection.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            welcomeSection.style.transition = 'all 0.8s ease';
            welcomeSection.style.opacity = '1';
            welcomeSection.style.transform = 'translateY(0)';
        }, 300);
    }
});

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

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