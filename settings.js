// Settings functionality
let settingsData = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    loadUserSettings();
    setupEventListeners();
    setupDailyReminderSystem();
    initializeMultiProfileSystem();
});

// Initialize settings page
function initializeSettings() {
    // Check if user is logged in
    const userEmail = localStorage.getItem('breathemate_email');
    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user email
    document.getElementById('userEmail').textContent = userEmail;
    
    // Load saved settings or set defaults
    loadSettingsFromStorage();
}

// Load user settings from localStorage
function loadUserSettings() {
    const savedSettings = localStorage.getItem('breathemate_settings');
    
    if (savedSettings) {
        settingsData = JSON.parse(savedSettings);
    } else {
        // Default settings
        settingsData = {
            notifications: {
                dailyReminders: true,
                dailyReminderTime: '09:00',
                healthAlerts: true,
                weeklyReports: true,
                appUpdates: false
            },
            recording: {
                autoSave: true,
                quality: 'high',
                micSensitivity: 7
            },
            privacy: {
                dataCollection: false,
                shareWithDoctors: false
            },
            preferences: {
                theme: 'light',
                language: 'en',
                dateFormat: 'mm/dd/yyyy',
                timeFormat: '12'
            },
            accessibility: {
                darkMode: false,
                highContrast: false,
                voiceReadout: false,
                voiceSpeed: 1.0,
                voiceVolume: 1.0,
                fontSize: 'medium',
                reduceMotion: false
            }
        };
        saveSettings();
    }
    
    applySettingsToUI();
}

// Load settings from storage and apply to UI
function loadSettingsFromStorage() {
    // This is called by loadUserSettings, but kept separate for clarity
}

// Apply settings to UI elements
function applySettingsToUI() {
    // Notification settings
    document.getElementById('dailyReminders').checked = settingsData.notifications.dailyReminders;
    document.getElementById('dailyReminderTime').value = settingsData.notifications.dailyReminderTime;
    document.getElementById('healthAlerts').checked = settingsData.notifications.healthAlerts;
    document.getElementById('weeklyReports').checked = settingsData.notifications.weeklyReports;
    document.getElementById('appUpdates').checked = settingsData.notifications.appUpdates;
    
    // Recording settings
    document.getElementById('autoSave').checked = settingsData.recording.autoSave;
    document.getElementById('recordingQuality').value = settingsData.recording.quality;
    document.getElementById('micSensitivity').value = settingsData.recording.micSensitivity;
    document.querySelector('.range-value').textContent = settingsData.recording.micSensitivity;
    
    // Privacy settings
    document.getElementById('dataCollection').checked = settingsData.privacy.dataCollection;
    document.getElementById('shareWithDoctors').checked = settingsData.privacy.shareWithDoctors;
    
    // App preferences
    document.getElementById('theme').value = settingsData.preferences.theme;
    document.getElementById('language').value = settingsData.preferences.language;
    document.getElementById('dateFormat').value = settingsData.preferences.dateFormat;
    document.getElementById('timeFormat').value = settingsData.preferences.timeFormat;
    
    // Accessibility settings
    if (settingsData.accessibility) {
        document.getElementById('darkMode').checked = settingsData.accessibility.darkMode || false;
        document.getElementById('highContrastMode').checked = settingsData.accessibility.highContrast || false;
        document.getElementById('voiceReadout').checked = settingsData.accessibility.voiceReadout || false;
        document.getElementById('voiceSpeed').value = settingsData.accessibility.voiceSpeed || 1.0;
        document.getElementById('voiceVolume').value = settingsData.accessibility.voiceVolume || 0.8;
        document.getElementById('fontSize').value = settingsData.accessibility.fontSize || 'normal';
        document.getElementById('reduceMotion').checked = settingsData.accessibility.reduceMotion || false;
        
        // Update voice settings UI
        toggleVoiceSettings(settingsData.accessibility.voiceReadout || false);
        
        // Apply accessibility settings immediately
        if (settingsData.accessibility.darkMode && !settingsData.accessibility.highContrast) {
            document.body.classList.add('dark-mode');
        }
        if (settingsData.accessibility.highContrast) {
            document.body.classList.add('high-contrast');
        }
        if (settingsData.accessibility.fontSize && settingsData.accessibility.fontSize !== 'normal') {
            document.body.classList.add(`font-${settingsData.accessibility.fontSize}`);
        }
        if (settingsData.accessibility.reduceMotion) {
            document.body.classList.add('reduce-motion');
        }
    }
    
    // Initialize daily reminder UI state
    updateDailyReminderUI();
    
    // Request notification permission if daily reminders are enabled
    if (settingsData.notifications.dailyReminders) {
        requestNotificationPermission();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Notification toggles
    document.getElementById('dailyReminders').addEventListener('change', function() {
        settingsData.notifications.dailyReminders = this.checked;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('healthAlerts').addEventListener('change', function() {
        settingsData.notifications.healthAlerts = this.checked;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('weeklyReports').addEventListener('change', function() {
        settingsData.notifications.weeklyReports = this.checked;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('appUpdates').addEventListener('change', function() {
        settingsData.notifications.appUpdates = this.checked;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    // Recording preferences
    document.getElementById('autoSave').addEventListener('change', function() {
        settingsData.recording.autoSave = this.checked;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('recordingQuality').addEventListener('change', function() {
        settingsData.recording.quality = this.value;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('micSensitivity').addEventListener('input', function() {
        settingsData.recording.micSensitivity = parseInt(this.value);
        document.querySelector('.range-value').textContent = this.value;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    // Privacy settings
    document.getElementById('dataCollection').addEventListener('change', function() {
        settingsData.privacy.dataCollection = this.checked;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('shareWithDoctors').addEventListener('change', function() {
        settingsData.privacy.shareWithDoctors = this.checked;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    // App preferences
    document.getElementById('theme').addEventListener('change', function() {
        settingsData.preferences.theme = this.value;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
        applyTheme(this.value);
    });
    
    document.getElementById('language').addEventListener('change', function() {
        settingsData.preferences.language = this.value;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('dateFormat').addEventListener('change', function() {
        settingsData.preferences.dateFormat = this.value;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('timeFormat').addEventListener('change', function() {
        settingsData.preferences.timeFormat = this.value;
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    // Accessibility & Display settings
    document.getElementById('darkMode').addEventListener('change', function() {
        settingsData.accessibility = settingsData.accessibility || {};
        settingsData.accessibility.darkMode = this.checked;
        saveSettings();
        applyDarkMode(this.checked);
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('highContrastMode').addEventListener('change', function() {
        settingsData.accessibility = settingsData.accessibility || {};
        settingsData.accessibility.highContrast = this.checked;
        saveSettings();
        applyHighContrast(this.checked);
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('voiceReadout').addEventListener('change', function() {
        settingsData.accessibility = settingsData.accessibility || {};
        settingsData.accessibility.voiceReadout = this.checked;
        saveSettings();
        toggleVoiceSettings(this.checked);
        applyVoiceReadout(this.checked);
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('voiceSpeed').addEventListener('input', function() {
        settingsData.accessibility = settingsData.accessibility || {};
        settingsData.accessibility.voiceSpeed = parseFloat(this.value);
        document.querySelector('#voiceSettingsItem .range-value').textContent = this.value + 'x';
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('voiceVolume').addEventListener('input', function() {
        settingsData.accessibility = settingsData.accessibility || {};
        settingsData.accessibility.voiceVolume = parseFloat(this.value);
        document.querySelector('#voiceVolumeItem .range-value').textContent = Math.round(this.value * 100) + '%';
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('fontSize').addEventListener('change', function() {
        settingsData.accessibility = settingsData.accessibility || {};
        settingsData.accessibility.fontSize = this.value;
        saveSettings();
        applyFontSize(this.value);
        showSettingChanged(this.closest('.setting-item'));
    });
    
    document.getElementById('reduceMotion').addEventListener('change', function() {
        settingsData.accessibility = settingsData.accessibility || {};
        settingsData.accessibility.reduceMotion = this.checked;
        saveSettings();
        applyReduceMotion(this.checked);
        showSettingChanged(this.closest('.setting-item'));
    });
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('breathemate_settings', JSON.stringify(settingsData));
}

// Show visual feedback when a setting is changed
function showSettingChanged(settingItem) {
    settingItem.classList.add('changed');
    setTimeout(() => {
        settingItem.classList.remove('changed');
    }, 2000);
}

// Apply theme changes
function applyTheme(theme) {
    // In a real app, this would apply theme changes
    showMessage(`Theme changed to ${theme}. Restart the app to see full effects.`, 'success');
}

// Account Settings Functions
function editProfile() {
    showMessage('Opening profile editor...', 'info');
    setTimeout(() => {
        showMessage('Profile editing feature coming soon! Update your personal information and preferences.', 'success');
    }, 1500);
}

function changeEmail() {
    const newEmail = prompt('Enter new email address:', document.getElementById('userEmail').textContent);
    if (newEmail && validateEmail(newEmail)) {
        document.getElementById('userEmail').textContent = newEmail;
        localStorage.setItem('breathemate_email', newEmail);
        showMessage('Email address updated successfully!', 'success');
    } else if (newEmail) {
        showMessage('Please enter a valid email address.', 'error');
    }
}

function changePassword() {
    showMessage('Opening secure password change...', 'info');
    setTimeout(() => {
        showMessage('Password change feature coming soon! For security, this will require email verification.', 'success');
    }, 1500);
}

// Privacy & Data Functions
function exportAllData() {
    const button = event.target.closest('.setting-action');
    button.classList.add('loading');
    
    setTimeout(() => {
        // Simulate data export
        const exportData = {
            exportDate: new Date().toISOString(),
            userProfile: {
                email: localStorage.getItem('breathemate_email'),
                username: localStorage.getItem('breathemate_username')
            },
            settings: settingsData,
            journalEntries: JSON.parse(localStorage.getItem('breathemate_journal') || '[]'),
            analysisHistory: 'Sample analysis data would be included here'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `BreatheMate_Complete_Export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        button.classList.remove('loading');
        showMessage('All data exported successfully!', 'success');
    }, 2000);
}

function deleteAccount() {
    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.');
    
    if (confirmDelete) {
        const finalConfirm = prompt('Type "DELETE" to confirm account deletion:');
        
        if (finalConfirm === 'DELETE') {
            // Clear all user data
            localStorage.clear();
            
            showMessage('Account deleted successfully. Redirecting to login...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showMessage('Account deletion cancelled.', 'info');
        }
    }
}

// Help & Support Functions
function openHelpCenter() {
    showMessage('Opening help center...', 'info');
    setTimeout(() => {
        showMessage('Help center coming soon! Browse FAQs, guides, and troubleshooting tips.', 'success');
    }, 1500);
}

function contactSupport() {
    showMessage('Opening support contact...', 'info');
    setTimeout(() => {
        showMessage('Support contact feature coming soon! Email: support@breathemate.com', 'success');
    }, 1500);
}

function openPrivacyPolicy() {
    showMessage('Opening privacy policy...', 'info');
    setTimeout(() => {
        showMessage('Privacy policy coming soon! We take your data privacy seriously.', 'success');
    }, 1500);
}

function checkForUpdates() {
    const button = event.target.closest('.setting-action');
    button.classList.add('loading');
    
    setTimeout(() => {
        button.classList.remove('loading');
        showMessage('You are using the latest version of BreatheMate!', 'success');
    }, 2000);
}

// Navigation Functions
function goBackToDashboard() {
    window.location.href = 'dashboard.html';
}

// Utility Functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

// Daily Reminder System
let dailyReminderInterval = null;
let notificationPermissionGranted = false;

// Setup daily reminder system
function setupDailyReminderSystem() {
    // Add event listeners for daily reminder settings
    const dailyRemindersToggle = document.getElementById('dailyReminders');
    const dailyReminderTime = document.getElementById('dailyReminderTime');
    
    dailyRemindersToggle.addEventListener('change', function() {
        settingsData.notifications.dailyReminders = this.checked;
        updateDailyReminderUI();
        
        if (this.checked) {
            requestNotificationPermission().then(() => {
                scheduleDailyReminder();
                showMessage('Daily reminders enabled! You\'ll be notified at your chosen time.', 'success');
            });
        } else {
            clearDailyReminder();
            showMessage('Daily reminders disabled.', 'info');
        }
        
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    dailyReminderTime.addEventListener('change', function() {
        settingsData.notifications.dailyReminderTime = this.value;
        
        if (settingsData.notifications.dailyReminders) {
            scheduleDailyReminder();
            
            const timeFormatted = formatTimeForDisplay(this.value);
            showMessage(`Daily reminder time updated to ${timeFormatted}`, 'success');
        }
        
        saveSettings();
        showSettingChanged(this.closest('.setting-item'));
    });
    
    // Initialize the reminder if enabled
    if (settingsData.notifications.dailyReminders) {
        requestNotificationPermission().then(() => {
            scheduleDailyReminder();
        });
    }
}

// Update daily reminder UI state
function updateDailyReminderUI() {
    const reminderTimeItem = document.getElementById('dailyReminderTimeItem');
    const isEnabled = settingsData.notifications.dailyReminders;
    
    if (isEnabled) {
        reminderTimeItem.classList.remove('disabled');
    } else {
        reminderTimeItem.classList.add('disabled');
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showMessage('Notifications not supported in this browser.', 'warning');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        notificationPermissionGranted = true;
        return true;
    }
    
    if (Notification.permission === 'denied') {
        showMessage('Notifications are blocked. Please enable them in browser settings.', 'warning');
        return false;
    }
    
    try {
        const permission = await Notification.requestPermission();
        notificationPermissionGranted = permission === 'granted';
        
        if (notificationPermissionGranted) {
            showMessage('Notifications enabled! You\'ll receive daily reminders.', 'success');
        } else {
            showMessage('Notifications denied. Daily reminders won\'t work.', 'warning');
        }
        
        return notificationPermissionGranted;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        showMessage('Error enabling notifications.', 'error');
        return false;
    }
}

// Schedule daily reminder
function scheduleDailyReminder() {
    // Clear existing reminder
    clearDailyReminder();
    
    if (!settingsData.notifications.dailyReminders || !notificationPermissionGranted) {
        return;
    }
    
    const reminderTime = settingsData.notifications.dailyReminderTime;
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
        
        // Store the timeout ID so we can clear it later
        dailyReminderInterval = setTimeout(() => {
            sendDailyReminder();
            // Schedule the next reminder for the following day
            scheduleNext();
        }, msUntilReminder);
        
        console.log(`Daily reminder scheduled for ${scheduledTime.toLocaleString()}`);
    }
    
    scheduleNext();
}

// Clear daily reminder
function clearDailyReminder() {
    if (dailyReminderInterval) {
        clearTimeout(dailyReminderInterval);
        dailyReminderInterval = null;
        console.log('Daily reminder cleared');
    }
}

// Send daily reminder notification
function sendDailyReminder() {
    if (!notificationPermissionGranted) {
        return;
    }
    
    // Check if user has already taken a test today
    const today = new Date().toDateString();
    const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    const todaysTests = journalEntries.filter(entry => {
        const entryDate = new Date(entry.date).toDateString();
        return entryDate === today && entry.type === 'breath_analysis';
    });
    
    if (todaysTests.length > 0) {
        // User already tested today, send a different message
        new Notification('BreatheMate - Great job! 🌟', {
            body: 'You\'ve already completed your breathing test today. Keep up the great work!',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'breathemate-daily-complete'
        });
        return;
    }
    
    // Send reminder to take test
    const notification = new Notification('BreatheMate - Daily Reminder 🫁', {
        body: 'Time for your daily breathing test! Track your lung health in just 30 seconds.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'breathemate-daily-reminder',
        requireInteraction: true,
        actions: [
            { action: 'take-test', title: 'Take Test Now' },
            { action: 'snooze', title: 'Remind Later' }
        ]
    });
    
    // Handle notification click
    notification.onclick = function() {
        window.focus();
        window.location.href = 'record.html';
        notification.close();
    };
    
    // Handle notification actions (if supported)
    if ('actions' in notification) {
        notification.addEventListener('notificationclick', function(event) {
            if (event.action === 'take-test') {
                window.focus();
                window.location.href = 'record.html';
            } else if (event.action === 'snooze') {
                // Snooze for 1 hour
                setTimeout(() => {
                    sendDailyReminder();
                }, 60 * 60 * 1000);
            }
            notification.close();
        });
    }
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        notification.close();
    }, 10000);
}

// Test daily reminder function
function testDailyReminder() {
    const button = event.target;
    
    // Add testing state
    button.classList.add('testing');
    button.innerHTML = '<i class="fas fa-bell"></i>Testing...';
    
    if (!notificationPermissionGranted) {
        requestNotificationPermission().then((granted) => {
            if (granted) {
                sendTestNotification();
            }
            resetTestButton(button);
        });
    } else {
        sendTestNotification();
        setTimeout(() => resetTestButton(button), 2000);
    }
}

// Send test notification
function sendTestNotification() {
    if (!notificationPermissionGranted) {
        showMessage('Please enable notifications first.', 'warning');
        return;
    }
    
    const timeFormatted = formatTimeForDisplay(settingsData.notifications.dailyReminderTime);
    
    const testNotification = new Notification('BreatheMate - Test Reminder 🧪', {
        body: `This is how your daily reminder will look! Scheduled for ${timeFormatted} every day.`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'breathemate-test-reminder'
    });
    
    testNotification.onclick = function() {
        window.focus();
        testNotification.close();
    };
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        testNotification.close();
    }, 5000);
    
    showMessage('Test notification sent! Check your notifications.', 'success');
}

// Reset test button
function resetTestButton(button) {
    button.classList.remove('testing');
    button.innerHTML = '<i class="fas fa-bell"></i>Test';
}

// Format time for display
function formatTimeForDisplay(time24) {
    const [hours, minutes] = time24.split(':').map(Number);
    const timeFormat = settingsData.preferences.timeFormat || '12';
    
    if (timeFormat === '12') {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
}

// Initialize reminder system on app start
function initializeDailyReminderOnAppStart() {
    // This function should be called when the app starts
    const settings = JSON.parse(localStorage.getItem('breathemate_settings') || '{}');
    
    if (settings.notifications?.dailyReminders) {
        requestNotificationPermission().then((granted) => {
            if (granted) {
                // Set up the daily reminder schedule
                const reminderTime = settings.notifications.dailyReminderTime || '09:00';
                scheduleDailyReminder();
                console.log('Daily reminder system initialized');
            }
        });
    }
}

// Multi-Profile System
let currentUserProfiles = [];
let activeProfileId = null;

// Initialize multi-profile system
function initializeMultiProfileSystem() {
    loadUserProfiles();
    updateCurrentUserDisplay();
    setupCaregiverMode();
}

// Load user profiles from localStorage
function loadUserProfiles() {
    const profiles = localStorage.getItem('breathemate_user_profiles');
    
    if (profiles) {
        currentUserProfiles = JSON.parse(profiles);
    } else {
        // Create default profile for current user
        const currentEmail = localStorage.getItem('breathemate_email') || 'demo@breathemate.com';
        const currentName = localStorage.getItem('breathemate_username') || 'Demo User';
        
        currentUserProfiles = [{
            id: generateProfileId(),
            name: currentName,
            email: currentEmail,
            relationship: 'self',
            age: null,
            gender: null,
            createdAt: new Date().toISOString(),
            isMainAccount: true,
            avatar: generateAvatarColor(),
            journalEntries: [],
            settings: { ...settingsData }
        }];
        
        saveUserProfiles();
    }
    
    // Set active profile if not set
    if (!activeProfileId) {
        activeProfileId = currentUserProfiles.find(p => p.isMainAccount)?.id || currentUserProfiles[0]?.id;
        localStorage.setItem('breathemate_active_profile', activeProfileId);
    }
}

// Save user profiles to localStorage
function saveUserProfiles() {
    localStorage.setItem('breathemate_user_profiles', JSON.stringify(currentUserProfiles));
}

// Generate unique profile ID
function generateProfileId() {
    return 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generate avatar color for new profiles
function generateAvatarColor() {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Update current user display
function updateCurrentUserDisplay() {
    const activeProfile = currentUserProfiles.find(p => p.id === activeProfileId);
    if (activeProfile) {
        const currentUserInfo = document.getElementById('currentUserInfo');
        if (currentUserInfo) {
            currentUserInfo.textContent = `${activeProfile.name} (${activeProfile.email})`;
        }
        
        // Update main user display
        localStorage.setItem('breathemate_username', activeProfile.name);
        localStorage.setItem('breathemate_email', activeProfile.email);
        
        // Update UI elements if they exist
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement) {
            userEmailElement.textContent = activeProfile.email;
        }
    }
}

// Open profile switcher modal
function openProfileSwitcher() {
    const modal = createProfileSwitcherModal();
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
}

// Create profile switcher modal
function createProfileSwitcherModal() {
    const modal = document.createElement('div');
    modal.className = 'profile-switcher-modal';
    modal.onclick = (e) => {
        if (e.target === modal) closeProfileSwitcher();
    };
    
    const activeProfile = currentUserProfiles.find(p => p.id === activeProfileId);
    
    modal.innerHTML = `
        <div class="profile-switcher-content">
            <div class="profile-switcher-header">
                <h3>Switch Profile</h3>
                <p>Select which user profile you'd like to use</p>
            </div>
            
            <div class="profiles-grid">
                ${currentUserProfiles.map(profile => {
                    const isActive = profile.id === activeProfileId;
                    const journalCount = getProfileJournalCount(profile.id);
                    const lastActivity = getProfileLastActivity(profile.id);
                    
                    return `
                        <div class="profile-card ${isActive ? 'active' : ''}" onclick="switchToProfile('${profile.id}')">
                            <div class="profile-avatar-large" style="background: ${profile.avatar}">
                                ${profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="profile-info">
                                <h4>${profile.name}</h4>
                                <p>${profile.relationship === 'self' ? 'Primary Account' : capitalizeFirst(profile.relationship)}</p>
                                <div class="profile-stats">
                                    <div class="profile-stat">
                                        <i class="fas fa-journal-whills"></i>
                                        <span>${journalCount} entries</span>
                                    </div>
                                    <div class="profile-stat">
                                        <i class="fas fa-clock"></i>
                                        <span>${lastActivity}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="form-actions">
                <button class="btn secondary" onclick="closeProfileSwitcher()">Cancel</button>
                <button class="btn primary" onclick="openAddUserModal(); closeProfileSwitcher();">Add New User</button>
            </div>
        </div>
    `;
    
    return modal;
}

// Switch to a specific profile
function switchToProfile(profileId) {
    const profile = currentUserProfiles.find(p => p.id === profileId);
    if (!profile) return;
    
    // Save current profile data before switching
    saveCurrentProfileData();
    
    // Switch to new profile
    activeProfileId = profileId;
    localStorage.setItem('breathemate_active_profile', activeProfileId);
    
    // Load new profile data
    loadProfileData(profile);
    
    // Update UI
    updateCurrentUserDisplay();
    
    // Close modal and show success
    closeProfileSwitcher();
    showMessage(`Switched to ${profile.name}'s profile`, 'success');
    
    // Refresh the page to apply all changes
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Save current profile data
function saveCurrentProfileData() {
    const currentProfile = currentUserProfiles.find(p => p.id === activeProfileId);
    if (currentProfile) {
        // Save current journal entries
        const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
        currentProfile.journalEntries = journalEntries;
        
        // Save current settings
        currentProfile.settings = { ...settingsData };
        
        saveUserProfiles();
    }
}

// Load profile data
function loadProfileData(profile) {
    // Load profile's journal entries
    localStorage.setItem('breathemate_journal', JSON.stringify(profile.journalEntries || []));
    
    // Load profile's settings
    if (profile.settings) {
        settingsData = { ...profile.settings };
        localStorage.setItem('breathemate_settings', JSON.stringify(settingsData));
        applySettingsToUI();
    }
    
    // Update user info
    localStorage.setItem('breathemate_username', profile.name);
    localStorage.setItem('breathemate_email', profile.email);
}

// Close profile switcher
function closeProfileSwitcher() {
    const modal = document.querySelector('.profile-switcher-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Open add user modal
function openAddUserModal() {
    const modal = createAddUserModal();
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
}

// Create add user modal
function createAddUserModal() {
    const modal = document.createElement('div');
    modal.className = 'add-user-modal';
    modal.onclick = (e) => {
        if (e.target === modal) closeAddUserModal();
    };
    
    modal.innerHTML = `
        <div class="add-user-content">
            <div class="add-user-header">
                <h3>Add New User</h3>
                <p>Create a profile for a family member or patient</p>
            </div>
            
            <form class="add-user-form" onsubmit="handleAddUser(event)">
                <div class="form-group">
                    <label for="newUserName">Full Name *</label>
                    <input type="text" id="newUserName" required placeholder="Enter full name">
                </div>
                
                <div class="form-group">
                    <label for="newUserEmail">Email Address *</label>
                    <input type="email" id="newUserEmail" required placeholder="Enter email address">
                </div>
                
                <div class="form-group">
                    <label for="newUserAge">Age</label>
                    <input type="number" id="newUserAge" min="1" max="120" placeholder="Enter age (optional)">
                </div>
                
                <div class="form-group">
                    <label for="newUserGender">Gender</label>
                    <select id="newUserGender">
                        <option value="">Select gender (optional)</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Relationship to you</label>
                    <div class="relationship-selector">
                        <div class="relationship-option" onclick="selectRelationship(this, 'child')">Child</div>
                        <div class="relationship-option" onclick="selectRelationship(this, 'parent')">Parent</div>
                        <div class="relationship-option" onclick="selectRelationship(this, 'spouse')">Spouse</div>
                        <div class="relationship-option" onclick="selectRelationship(this, 'sibling')">Sibling</div>
                        <div class="relationship-option" onclick="selectRelationship(this, 'patient')">Patient</div>
                        <div class="relationship-option" onclick="selectRelationship(this, 'other')">Other</div>
                    </div>
                    <input type="hidden" id="selectedRelationship" value="">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn secondary" onclick="closeAddUserModal()">Cancel</button>
                    <button type="submit" class="btn primary">Add User</button>
                </div>
            </form>
        </div>
    `;
    
    return modal;
}

// Select relationship option
function selectRelationship(element, relationship) {
    // Remove selection from all options
    document.querySelectorAll('.relationship-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select current option
    element.classList.add('selected');
    document.getElementById('selectedRelationship').value = relationship;
}

// Handle add user form submission
function handleAddUser(event) {
    event.preventDefault();
    
    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const age = document.getElementById('newUserAge').value;
    const gender = document.getElementById('newUserGender').value;
    const relationship = document.getElementById('selectedRelationship').value;
    
    // Validation
    if (!name || !email) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!relationship) {
        showMessage('Please select a relationship.', 'error');
        return;
    }
    
    // Check if email already exists
    const existingProfile = currentUserProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existingProfile) {
        showMessage('A user with this email already exists.', 'error');
        return;
    }
    
    // Create new profile
    const newProfile = {
        id: generateProfileId(),
        name: name,
        email: email,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        relationship: relationship,
        createdAt: new Date().toISOString(),
        isMainAccount: false,
        avatar: generateAvatarColor(),
        journalEntries: [],
        settings: { ...settingsData } // Copy current settings as default
    };
    
    // Add to profiles
    currentUserProfiles.push(newProfile);
    saveUserProfiles();
    
    // Close modal and show success
    closeAddUserModal();
    showMessage(`Successfully added ${name} to your family profiles!`, 'success');
    
    // Update caregiver mode if not already enabled
    const caregiverMode = document.getElementById('caregiverMode');
    if (caregiverMode && !caregiverMode.checked) {
        caregiverMode.checked = true;
        settingsData.caregiverMode = true;
        saveSettings();
        updateCaregiverFeatures();
    }
}

// Close add user modal
function closeAddUserModal() {
    const modal = document.querySelector('.add-user-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Open user management modal
function openUserManagement() {
    const modal = createUserManagementModal();
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
}

// Create user management modal
function createUserManagementModal() {
    const modal = document.createElement('div');
    modal.className = 'user-management-modal';
    modal.onclick = (e) => {
        if (e.target === modal) closeUserManagement();
    };
    
    modal.innerHTML = `
        <div class="user-management-content">
            <div class="user-management-header">
                <h3>Manage User Profiles</h3>
                <button class="btn primary" onclick="openAddUserModal(); closeUserManagement();">
                    <i class="fas fa-plus"></i> Add User
                </button>
            </div>
            
            <div class="users-list">
                ${currentUserProfiles.map(profile => {
                    const isActive = profile.id === activeProfileId;
                    const journalCount = getProfileJournalCount(profile.id);
                    
                    return `
                        <div class="user-item ${isActive ? 'current-user' : ''}">
                            <div class="user-item-info">
                                <div class="profile-avatar-large" style="background: ${profile.avatar}">
                                    ${profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div class="user-item-details">
                                    <h4>${profile.name} ${isActive ? '(Current)' : ''}</h4>
                                    <p>${profile.email} • ${capitalizeFirst(profile.relationship)} • ${journalCount} entries</p>
                                </div>
                            </div>
                            <div class="user-item-actions">
                                ${!isActive ? `<button class="user-action-btn" onclick="switchToProfile('${profile.id}'); closeUserManagement();">Switch</button>` : ''}
                                <button class="user-action-btn" onclick="editUserProfile('${profile.id}')">Edit</button>
                                ${!profile.isMainAccount ? `<button class="user-action-btn danger" onclick="deleteUserProfile('${profile.id}')">Delete</button>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="form-actions">
                <button class="btn secondary" onclick="closeUserManagement()">Close</button>
            </div>
        </div>
    `;
    
    return modal;
}

// Close user management modal
function closeUserManagement() {
    const modal = document.querySelector('.user-management-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Setup caregiver mode
function setupCaregiverMode() {
    const caregiverToggle = document.getElementById('caregiverMode');
    if (caregiverToggle) {
        // Load caregiver mode state
        caregiverToggle.checked = settingsData.caregiverMode || false;
        updateCaregiverFeatures();
        
        caregiverToggle.addEventListener('change', function() {
            settingsData.caregiverMode = this.checked;
            saveSettings();
            updateCaregiverFeatures();
            
            if (this.checked) {
                showMessage('Caregiver mode enabled! Enhanced features for managing multiple profiles.', 'success');
            } else {
                showMessage('Caregiver mode disabled.', 'info');
            }
            
            showSettingChanged(this.closest('.setting-item'));
        });
    }
}

// Update caregiver features display
function updateCaregiverFeatures() {
    const caregiverFeatures = document.querySelector('.caregiver-features');
    const caregiverMode = document.getElementById('caregiverMode');
    
    if (!caregiverFeatures) {
        // Create caregiver features section if it doesn't exist
        const caregiverSection = document.querySelector('#caregiverMode').closest('.setting-item');
        const featuresDiv = document.createElement('div');
        featuresDiv.className = 'caregiver-features';
        featuresDiv.innerHTML = `
            <h4><i class="fas fa-heart"></i>Caregiver Features Enabled</h4>
            <ul>
                <li>Quick profile switching in dashboard header</li>
                <li>Consolidated health reports for all users</li>
                <li>Shared reminder notifications for family members</li>
                <li>Export data for all managed profiles</li>
                <li>Emergency contact alerts for high-risk results</li>
                <li>Care notes and observations tracking</li>
            </ul>
        `;
        caregiverSection.parentNode.insertBefore(featuresDiv, caregiverSection.nextSibling);
    }
    
    const features = document.querySelector('.caregiver-features');
    if (features) {
        if (caregiverMode && caregiverMode.checked) {
            features.classList.add('active');
        } else {
            features.classList.remove('active');
        }
    }
}

// Accessibility Functions
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Apply dark mode
function applyDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
        showMessage('Dark mode enabled! Easier on the eyes for low-light environments.', 'success');
    } else {
        document.body.classList.remove('dark-mode');
        showMessage('Dark mode disabled.', 'info');
    }
    
    // Apply to all pages by storing in localStorage
    localStorage.setItem('breathemate_dark_mode', enabled);
}

// Apply high contrast mode
function applyHighContrast(enabled) {
    if (enabled) {
        document.body.classList.add('high-contrast');
        document.body.classList.remove('dark-mode'); // Remove dark mode if high contrast is enabled
        showMessage('High contrast mode enabled! Enhanced visibility for better accessibility.', 'success');
    } else {
        document.body.classList.remove('high-contrast');
        // Re-apply dark mode if it was previously enabled
        if (settingsData.accessibility?.darkMode) {
            document.body.classList.add('dark-mode');
        }
        showMessage('High contrast mode disabled.', 'info');
    }
    
    localStorage.setItem('breathemate_high_contrast', enabled);
}

// Apply voice readout functionality
function applyVoiceReadout(enabled) {
    if (enabled) {
        document.body.classList.add('voice-readout');
        enableVoiceReadout();
        showMessage('Voice readout enabled! Navigation and content will be announced.', 'success');
    } else {
        document.body.classList.remove('voice-readout');
        disableVoiceReadout();
        showMessage('Voice readout disabled.', 'info');
    }
    
    localStorage.setItem('breathemate_voice_readout', enabled);
}

// Enable voice readout functionality
function enableVoiceReadout() {
    // Add click listeners for voice readout
    document.addEventListener('click', handleVoiceClick);
    document.addEventListener('focus', handleVoiceFocus, true);
    
    // Announce that voice readout is enabled
    speak('Voice readout enabled. Click on any element to hear it read aloud.');
}

// Disable voice readout functionality
function disableVoiceReadout() {
    document.removeEventListener('click', handleVoiceClick);
    document.removeEventListener('focus', handleVoiceFocus, true);
    
    // Stop any current speech
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
}

// Handle click events for voice readout
function handleVoiceClick(event) {
    if (!settingsData.accessibility?.voiceReadout) return;
    
    const element = event.target;
    const text = getElementText(element);
    
    if (text) {
        speak(text);
    }
}

// Handle focus events for voice readout
function handleVoiceFocus(event) {
    if (!settingsData.accessibility?.voiceReadout) return;
    
    const element = event.target;
    const text = getElementText(element);
    
    if (text) {
        speak(text);
    }
}

// Get readable text from an element
function getElementText(element) {
    // Priority order for getting text
    const text = element.getAttribute('aria-label') ||
                 element.getAttribute('title') ||
                 element.textContent?.trim() ||
                 element.getAttribute('placeholder') ||
                 element.getAttribute('alt') ||
                 element.tagName.toLowerCase();
    
    // Add context for form elements
    if (element.tagName === 'INPUT') {
        const type = element.type;
        const label = element.closest('.setting-item')?.querySelector('.setting-info h3')?.textContent;
        
        if (type === 'checkbox') {
            const checked = element.checked ? 'enabled' : 'disabled';
            return `${label || 'Checkbox'} is ${checked}`;
        } else if (type === 'range') {
            return `${label || 'Slider'} set to ${element.value}`;
        } else {
            return `${label || 'Input field'}: ${text}`;
        }
    }
    
    // Add context for buttons
    if (element.tagName === 'BUTTON') {
        return `Button: ${text}`;
    }
    
    // Add context for links
    if (element.tagName === 'A') {
        return `Link: ${text}`;
    }
    
    // Add context for headings
    if (element.tagName.match(/^H[1-6]$/)) {
        return `Heading: ${text}`;
    }
    
    return text;
}

// Speak text using Web Speech API
function speak(text) {
    if (!text || !speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create new utterance
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
    currentUtterance.rate = settingsData.accessibility?.voiceSpeed || 1.0;
    currentUtterance.volume = settingsData.accessibility?.voiceVolume || 0.8;
    currentUtterance.pitch = 1.0;
    
    // Use a pleasant voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Alex'))
    );
    
    if (preferredVoice) {
        currentUtterance.voice = preferredVoice;
    }
    
    // Speak the text
    speechSynthesis.speak(currentUtterance);
}

// Test voice readout function
function testVoiceReadout() {
    const testText = `Hello! This is a test of the voice readout feature. 
                     The current voice speed is ${settingsData.accessibility?.voiceSpeed || 1.0} times normal speed, 
                     and the volume is ${Math.round((settingsData.accessibility?.voiceVolume || 0.8) * 100)} percent. 
                     Voice readout will announce page elements as you navigate and interact with them.`;
    
    speak(testText);
    showMessage('Voice test completed! Adjust speed and volume as needed.', 'success');
}

// Toggle voice settings visibility
function toggleVoiceSettings(enabled) {
    const voiceSettings = document.querySelectorAll('.voice-settings');
    
    voiceSettings.forEach(setting => {
        if (enabled) {
            setting.style.display = 'flex';
            setting.classList.add('active');
        } else {
            setting.style.display = 'none';
            setting.classList.remove('active');
        }
    });
}

// Apply font size
function applyFontSize(size) {
    // Remove existing font size classes
    document.body.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
    
    // Add new font size class
    if (size !== 'normal') {
        document.body.classList.add(`font-${size}`);
    }
    
    localStorage.setItem('breathemate_font_size', size);
    showMessage(`Font size changed to ${size}.`, 'success');
}

// Apply reduced motion
function applyReduceMotion(enabled) {
    if (enabled) {
        document.body.classList.add('reduce-motion');
        showMessage('Reduced motion enabled. Animations and transitions minimized.', 'success');
    } else {
        document.body.classList.remove('reduce-motion');
        showMessage('Reduced motion disabled. Full animations restored.', 'info');
    }
    
    localStorage.setItem('breathemate_reduce_motion', enabled);
}

// Initialize accessibility settings on page load
function initializeAccessibilitySettings() {
    // Apply saved accessibility settings
    const darkMode = localStorage.getItem('breathemate_dark_mode') === 'true';
    const highContrast = localStorage.getItem('breathemate_high_contrast') === 'true';
    const voiceReadout = localStorage.getItem('breathemate_voice_readout') === 'true';
    const fontSize = localStorage.getItem('breathemate_font_size') || 'normal';
    const reduceMotion = localStorage.getItem('breathemate_reduce_motion') === 'true';
    
    if (highContrast) {
        document.body.classList.add('high-contrast');
    } else if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    if (voiceReadout) {
        document.body.classList.add('voice-readout');
        // Wait for page to fully load before enabling voice features
        setTimeout(() => {
            enableVoiceReadout();
        }, 1000);
    }
    
    if (fontSize !== 'normal') {
        document.body.classList.add(`font-${fontSize}`);
    }
    
    if (reduceMotion) {
        document.body.classList.add('reduce-motion');
    }
    
    // Initialize voice settings UI
    if (settingsData.accessibility?.voiceReadout) {
        toggleVoiceSettings(true);
        
        // Update voice range displays
        const voiceSpeedValue = document.querySelector('#voiceSettingsItem .range-value');
        const voiceVolumeValue = document.querySelector('#voiceVolumeItem .range-value');
        
        if (voiceSpeedValue) {
            voiceSpeedValue.textContent = (settingsData.accessibility.voiceSpeed || 1.0) + 'x';
        }
        if (voiceVolumeValue) {
            voiceVolumeValue.textContent = Math.round((settingsData.accessibility.voiceVolume || 0.8) * 100) + '%';
        }
    }
}

// Keyboard navigation enhancement for accessibility
function enhanceKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Skip if not in voice readout mode
        if (!settingsData.accessibility?.voiceReadout) return;
        
        // Announce current focus on Tab navigation
        if (event.key === 'Tab') {
            setTimeout(() => {
                const focused = document.activeElement;
                const text = getElementText(focused);
                if (text) {
                    speak(`Focused on: ${text}`);
                }
            }, 100);
        }
        
        // Read page title on Alt+T
        if (event.altKey && event.key === 't') {
            event.preventDefault();
            const title = document.title || 'BreatheMate Settings';
            speak(`Page title: ${title}`);
        }
        
        // Read main heading on Alt+H
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            const mainHeading = document.querySelector('h1')?.textContent || 'Settings';
            speak(`Main heading: ${mainHeading}`);
        }
        
        // Stop speech on Escape
        if (event.key === 'Escape') {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
                speak('Speech stopped');
            }
        }
    });
}

// Add accessibility features to the initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize accessibility after a short delay to ensure all elements are loaded
    setTimeout(() => {
        initializeAccessibilitySettings();
        enhanceKeyboardNavigation();
    }, 500);
});