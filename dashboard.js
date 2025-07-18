// Dashboard functionality with Firebase Authentication Guard
document.addEventListener('DOMContentLoaded', function() {
    // Authentication guard - check before initializing dashboard
    if (!checkAuthentication()) {
        return; // Exit if not authenticated
    }
    
    initializeDashboard();
    loadUserData();
    initializeStats();
    initializeHealthTracking();
    initializeVitalSigns();
    loadJournalEntries();
});

// Enhanced authentication check with Firebase support
function checkAuthentication() {
    const userEmail = localStorage.getItem('breathemate_email');
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    const userUid = localStorage.getItem('breathemate_uid');
    
    if (!userEmail && !isGuest) {
        // No authentication found
        console.log('❌ No authentication found - redirecting to login');
        redirectToLogin();
        return false;
    }
    
    // Check for Firebase authentication
    if (window.firebaseAuth) {
        const currentUser = window.firebaseAuth.currentUser;
        if (!currentUser && !isGuest) {
            console.log('❌ Firebase user not authenticated - redirecting to login');
            redirectToLogin();
            return false;
        }
    }
    
    // Show authentication status
    if (isGuest) {
        showGuestModeIndicator();
    } else if (userUid) {
        showAuthenticatedUserIndicator();
    }
    
    return true;
}

// Redirect to login page
function redirectToLogin() {
    // Clear any invalid authentication data
    localStorage.removeItem('breathemate_email');
    localStorage.removeItem('breathemate_username');
    localStorage.removeItem('breathemate_uid');
    localStorage.removeItem('breathemate_guest_mode');
    
    // Show message before redirect
    showMessage('Please sign in to access BreatheMate', 'info');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Show guest mode indicator
function showGuestModeIndicator() {
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        // Add guest indicator
        profileBtn.innerHTML = `
            <div class="profile-avatar guest-avatar">
                <i class="fas fa-user-clock"></i>
            </div>
            <div class="profile-info">
                <span class="profile-name">Guest User</span>
                <span class="profile-status">Limited Access</span>
            </div>
            <i class="fas fa-chevron-down"></i>
        `;
        
        // Add guest styling
        profileBtn.classList.add('guest-mode');
    }
    
    // Show guest limitations banner
    setTimeout(() => {
        showGuestLimitationsBanner();
    }, 2000);
}

// Show authenticated user indicator
function showAuthenticatedUserIndicator() {
    const provider = localStorage.getItem('breathemate_provider') || 'email';
    const emailVerified = localStorage.getItem('breathemate_email_verified') === 'true';
    
    // Add verification badge if email verified
    if (emailVerified && provider === 'email') {
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            const verificationBadge = document.createElement('div');
            verificationBadge.className = 'verification-badge';
            verificationBadge.innerHTML = '<i class="fas fa-check-circle"></i>';
            verificationBadge.title = 'Verified Account';
            profileBtn.appendChild(verificationBadge);
        }
    }
    
    // Show provider-specific indicators
    if (provider === 'google') {
        const profileInfo = document.querySelector('.profile-info');
        if (profileInfo) {
            const googleBadge = document.createElement('span');
            googleBadge.className = 'provider-badge google';
            googleBadge.innerHTML = '<i class="fab fa-google"></i>';
            googleBadge.title = 'Google Account';
            profileInfo.appendChild(googleBadge);
        }
    }
}

// Show guest limitations banner
function showGuestLimitationsBanner() {
    const existingBanner = document.querySelector('.guest-limitations-banner');
    if (existingBanner) return; // Already shown
    
    const banner = document.createElement('div');
    banner.className = 'guest-limitations-banner';
    banner.innerHTML = `
        <div class="banner-content">
            <div class="banner-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="banner-text">
                <strong>Guest Mode Active</strong>
                <p>You're using limited features. <a href="index.html" class="upgrade-link">Sign up</a> to unlock full health tracking!</p>
            </div>
            <button class="banner-close" onclick="closeGuestBanner()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Insert at top of main content
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.insertBefore(banner, mainContent.firstChild);
}

// Close guest banner
function closeGuestBanner() {
    const banner = document.querySelector('.guest-limitations-banner');
    if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => banner.remove(), 300);
    }
}

// Initialize dashboard
function initializeDashboard() {
    // Check if user is logged in
    const userEmail = localStorage.getItem('breathemate_email');
    if (!userEmail && localStorage.getItem('breathemate_guest_mode') !== 'true') {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    // Load user name from localStorage or use default
    const userName = localStorage.getItem('breathemate_username') || 'Demo User';
    const userNameElement = document.getElementById('userName');
    const profileNameElement = document.getElementById('profileName');
    
    if (userNameElement) userNameElement.textContent = userName;
    if (profileNameElement) profileNameElement.textContent = userName;
    
    // Load user photo if available
    const photoURL = localStorage.getItem('breathemate_photo_url');
    if (photoURL) {
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) {
            profileAvatar.style.backgroundImage = `url(${photoURL})`;
            profileAvatar.style.backgroundSize = 'cover';
            profileAvatar.style.backgroundPosition = 'center';
            profileAvatar.innerHTML = ''; // Remove default icon
        }
    }
    
    // Add click handlers for closing dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.profile-dropdown')) {
            closeProfileMenu();
        }
        if (!event.target.closest('.notification-btn') && !event.target.closest('.notification-panel')) {
            closeNotifications();
        }
    });

    // Initialize multi-profile support if available
    initializeMultiProfileSupport();
}

// Initialize multi-profile support
function initializeMultiProfileSupport() {
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    
    if (profiles.length > 1 && !isGuest) {
        // Show profile switcher in header
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.classList.add('multi-profile');
            
            // Add profile count indicator
            const profileCount = document.createElement('div');
            profileCount.className = 'profile-count';
            profileCount.textContent = profiles.length;
            profileBtn.appendChild(profileCount);
        }
    }
}

// Enhanced load user data with Firebase support
function loadUserData() {
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    
    // Simulate loading user data from backend or Firebase
    const userData = {
        name: localStorage.getItem('breathemate_username') || 'Demo User',
        email: localStorage.getItem('breathemate_email') || 'demo@breathemate.com',
        uid: localStorage.getItem('breathemate_uid') || null,
        provider: localStorage.getItem('breathemate_provider') || 'email',
        emailVerified: localStorage.getItem('breathemate_email_verified') === 'true',
        photoURL: localStorage.getItem('breathemate_photo_url') || null,
        lastScan: localStorage.getItem('breathemate_last_scan') || null,
        riskLevel: localStorage.getItem('breathemate_risk_level') || 'No scan yet',
        dailyStreak: parseInt(localStorage.getItem('breathemate_daily_streak')) || 0,
        isGuest: isGuest
    };
    
    // Update UI with user data
    updateUserInterface(userData);
    
    // Load additional data for authenticated users
    if (!isGuest && userData.uid) {
        loadFirebaseUserData(userData.uid);
    }
}

// Load user data from Firebase Firestore
async function loadFirebaseUserData(uid) {
    if (!window.firebaseDb) return;
    
    try {
        const userDoc = await window.firebaseDb.doc(`users/${uid}`).get();
        
        if (userDoc.exists) {
            const firebaseData = userDoc.data();
            
            // Update local storage with Firebase data
            if (firebaseData.settings) {
                localStorage.setItem('breathemate_settings', JSON.stringify(firebaseData.settings));
            }
            
            if (firebaseData.profiles) {
                localStorage.setItem('breathemate_user_profiles', JSON.stringify(firebaseData.profiles));
            }
            
            if (firebaseData.journalEntries) {
                localStorage.setItem('breathemate_journal', JSON.stringify(firebaseData.journalEntries));
                loadJournalEntries(); // Refresh journal display
            }
            
            console.log('✅ Firebase user data synchronized');
        }
    } catch (error) {
        console.error('Error loading Firebase user data:', error);
    }
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
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    
    if (isGuest) {
        showMessage('Sign up to access profile management and save your data!', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
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
    
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    
    if (isGuest) {
        // Guest logout
        localStorage.removeItem('breathemate_guest_mode');
        localStorage.removeItem('breathemate_guest_id');
        localStorage.removeItem('breathemate_username');
        localStorage.removeItem('breathemate_email');
        
        showMessage('Guest session ended. Redirecting to login...', 'info');
    } else if (window.firebaseAuth && window.breatheMateAuth) {
        // Firebase logout
        window.breatheMateAuth.signOut();
        return; // Firebase auth will handle the redirect
    } else {
        // Fallback logout
        localStorage.removeItem('breathemate_email');
        localStorage.removeItem('breathemate_username');
        localStorage.removeItem('breathemate_uid');
        localStorage.removeItem('breathemate_remember');
        
        showMessage('Logging out...', 'info');
    }
    
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
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    if (isGuest) return; // Don't save guest data
    
    const profiles = JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]');
    const activeProfileId = localStorage.getItem('breathemate_active_profile');
    const currentProfile = profiles.find(p => p.id === activeProfileId);
    
    if (currentProfile) {
        // Save current journal entries
        const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
        currentProfile.journalEntries = journalEntries;
        
        // Save updated profiles
        localStorage.setItem('breathemate_user_profiles', JSON.stringify(profiles));
        
        // Sync with Firebase if available
        syncWithFirebase();
    }
}

// Sync data with Firebase
async function syncWithFirebase() {
    const uid = localStorage.getItem('breathemate_uid');
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    
    if (!uid || isGuest || !window.firebaseDb) return;
    
    try {
        const userRef = window.firebaseDb.doc(`users/${uid}`);
        
        const updateData = {
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            journalEntries: JSON.parse(localStorage.getItem('breathemate_journal') || '[]'),
            profiles: JSON.parse(localStorage.getItem('breathemate_user_profiles') || '[]'),
            settings: JSON.parse(localStorage.getItem('breathemate_settings') || '{}')
        };
        
        await userRef.update(updateData);
        console.log('✅ Data synced with Firebase');
        
    } catch (error) {
        console.error('Error syncing with Firebase:', error);
    }
}

// Auto-sync data periodically
setInterval(() => {
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    if (!isGuest) {
        syncWithFirebase();
    }
}, 5 * 60 * 1000); // Sync every 5 minutes

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

// AI Chat functionality
let aiChatOpen = false;
let aiChatMessages = [];
let isAITyping = false;

// Initialize AI chat system
function initializeAIChat() {
    // Load previous messages
    const savedMessages = localStorage.getItem('breathemate_ai_messages');
    if (savedMessages) {
        aiChatMessages = JSON.parse(savedMessages);
        displayAIMessages();
    } else {
        // Send initial greeting
        setTimeout(() => {
            sendInitialAIGreeting();
        }, 2000);
    }
    
    // Check if should show notification dot
    checkAINotifications();
}

// Send initial AI greeting based on user data
function sendInitialAIGreeting() {
    const riskLevel = localStorage.getItem('breathemate_risk_level') || 'No scan yet';
    const lastScan = localStorage.getItem('breathemate_last_scan');
    
    let greeting = "Hi! I'm your AI health assistant. 👋";
    let followUp = "";
    
    if (riskLevel === 'No scan yet') {
        followUp = "I noticed you haven't taken a breathing test yet. Would you like me to guide you through your first test?";
    } else if (riskLevel.includes('Medium') || riskLevel.includes('High')) {
        greeting = "Hi! I noticed your breath seems irregular today. Want me to help understand why? 🫁";
        followUp = "I can suggest some breathing exercises and tips to help improve your respiratory health.";
    } else {
        followUp = "Your breathing patterns look good! I'm here if you need any health tips or have questions.";
    }
    
    addAIMessage(greeting);
    if (followUp) {
        setTimeout(() => {
            addAIMessage(followUp);
        }, 1500);
    }
    
    // Show notification dot
    showAINotification();
}

// Toggle AI chat window
function toggleAIChat() {
    const chatWindow = document.getElementById('aiChatWindow');
    const notificationDot = document.getElementById('aiNotificationDot');
    
    if (aiChatOpen) {
        closeAIChat();
    } else {
        aiChatOpen = true;
        chatWindow.classList.add('active');
        notificationDot.classList.remove('active');
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('aiChatInput').focus();
        }, 300);
    }
}

// Close AI chat
function closeAIChat() {
    const chatWindow = document.getElementById('aiChatWindow');
    aiChatOpen = false;
    chatWindow.classList.remove('active');
}

// Add AI message to chat
function addAIMessage(message, isUser = false) {
    const messageObj = {
        text: message,
        isUser: isUser,
        timestamp: new Date().toISOString()
    };
    
    aiChatMessages.push(messageObj);
    saveAIMessages();
    displayAIMessages();
    
    // Scroll to bottom
    setTimeout(() => {
        const messagesContainer = document.getElementById('aiChatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Display AI messages in chat
function displayAIMessages() {
    const messagesContainer = document.getElementById('aiChatMessages');
    messagesContainer.innerHTML = '';
    
    aiChatMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${msg.isUser ? 'user' : 'ai'}`;
        
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            ${msg.text}
            <div class="ai-message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    });
}

// Show typing indicator
function showAITyping() {
    const messagesContainer = document.getElementById('aiChatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message-typing';
    typingDiv.id = 'ai-typing-indicator';
    
    typingDiv.innerHTML = `
        <span>AI is typing</span>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    isAITyping = true;
}

// Remove typing indicator
function hideAITyping() {
    const typingIndicator = document.getElementById('ai-typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isAITyping = false;
}

// Send user message
function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    
    if (!message || isAITyping) return;
    
    // Add user message
    addAIMessage(message, true);
    input.value = '';
    
    // Process AI response
    processAIResponse(message);
}

// Send quick message
function sendQuickMessage(type) {
    let message = '';
    
    switch (type) {
        case 'breathing tips':
            message = 'Can you give me some breathing tips?';
            break;
        case 'analyze symptoms':
            message = 'Help me understand my symptoms';
            break;
        case 'breathing exercise':
            message = 'Guide me through a breathing exercise';
            break;
    }
    
    if (message) {
        document.getElementById('aiChatInput').value = message;
        sendAIMessage();
    }
}

// Process AI response based on user input
function processAIResponse(userMessage) {
    showAITyping();
    
    // Simulate AI processing delay
    setTimeout(() => {
        const response = generateAIResponse(userMessage);
        hideAITyping();
        addAIMessage(response);
    }, 1000 + Math.random() * 2000);
}

// Generate AI response based on keywords and context
function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    const riskLevel = localStorage.getItem('breathemate_risk_level') || 'No scan yet';
    const journalEntries = JSON.parse(localStorage.getItem('breathemate_journal') || '[]');
    
    // Breathing tips
    if (message.includes('tip') || message.includes('advice') || message.includes('help')) {
        const tips = [
            "💧 Drink warm water - it helps soothe your airways and can reduce throat irritation.",
            "🌿 Avoid allergens like dust, pollen, and strong scents that might trigger breathing issues.",
            "🧘‍♀️ Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8 seconds.",
            "🚶‍♀️ Take gentle walks in fresh air to strengthen your respiratory muscles.",
            "🍯 A teaspoon of honey can help soothe throat irritation and reduce coughing.",
            "💨 Practice diaphragmatic breathing - place one hand on chest, one on belly, focus on belly rising."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }
    
    // Symptom analysis
    if (message.includes('symptom') || message.includes('irregular') || message.includes('analyze')) {
        if (riskLevel.includes('High')) {
            return "Based on your recent analysis showing high risk, I recommend consulting a healthcare provider soon. In the meantime: avoid triggers, stay hydrated, and practice gentle breathing exercises.";
        } else if (riskLevel.includes('Medium')) {
            return "Your breathing shows some irregularities. Common causes include stress, allergies, or environmental factors. Try drinking warm water and avoiding allergens.";
        } else {
            return "Your breathing patterns look healthy! Keep monitoring regularly and maintain good respiratory hygiene.";
        }
    }
    
    // Breathing exercises
    if (message.includes('exercise') || message.includes('breathing') || message.includes('guide')) {
        return "Let's try a simple breathing exercise! 🧘‍♀️\n\n1. Sit comfortably and relax your shoulders\n2. Breathe in slowly through your nose for 4 counts\n3. Hold your breath for 7 counts\n4. Exhale slowly through your mouth for 8 counts\n5. Repeat 4-6 times\n\nThis can help reduce stress and improve lung function!";
    }
    
    // Emergency or concerning symptoms
    if (message.includes('emergency') || message.includes('urgent') || message.includes('severe') || message.includes('chest pain')) {
        return "⚠️ If you're experiencing severe breathing difficulties, chest pain, or other emergency symptoms, please call 911 immediately. For non-emergency concerns, contact your healthcare provider.";
    }
    
    // Test reminders
    if (message.includes('test') || message.includes('record') || message.includes('scan')) {
        return "Regular breathing tests help track your respiratory health! I recommend testing daily if possible. Would you like me to remind you to take tests?";
    }
    
    // General health inquiry
    if (message.includes('how') && (message.includes('health') || message.includes('doing'))) {
        const entries = journalEntries.length;
        if (entries > 0) {
            return `You've been doing great with ${entries} journal entries! Your commitment to tracking your breathing health is excellent. Keep up the good work! 🌟`;
        } else {
            return "I'd love to help you track your health better! Consider starting with a breathing test and keeping a symptom journal.";
        }
    }
    
    // Default responses
    const defaultResponses = [
        "I'm here to help with your breathing health! Ask me about symptoms, breathing exercises, or health tips.",
        "That's interesting! Can you tell me more about how you're feeling today?",
        "I can help with breathing tips, symptom analysis, or guide you through exercises. What would be most helpful?",
        "Your respiratory health is important! Feel free to ask me anything about breathing patterns, symptoms, or wellness tips."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Handle enter key in chat input
function handleAIChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

// Save AI messages to localStorage
function saveAIMessages() {
    localStorage.setItem('breathemate_ai_messages', JSON.stringify(aiChatMessages));
}

// Show AI notification dot
function showAINotification() {
    const notificationDot = document.getElementById('aiNotificationDot');
    notificationDot.classList.add('active');
}

// Check if should show AI notifications
function checkAINotifications() {
    const lastAIInteraction = localStorage.getItem('breathemate_last_ai_interaction');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (!lastAIInteraction || new Date(lastAIInteraction) < twentyFourHoursAgo) {
        showAINotification();
    }
}

// Update last AI interaction time
function updateAIInteraction() {
    localStorage.setItem('breathemate_last_ai_interaction', new Date().toISOString());
}

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