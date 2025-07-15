/**
 * BreatheMate Authentication System
 * Combines Firebase and Simplified local authentication methods
 */

class BreatheMateAuth {
    constructor() {
        // Remove Google provider initialization
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDb;
        this.currentUser = null;
        this.isGuest = false;
        
        this.initializeAuthListener();
        this.setupEventListeners();
    }

    // Initialize authentication state listener
    initializeAuthListener() {
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            
            if (user && !this.isGuest) {
                // User is signed in
                console.log('✅ User authenticated:', user.email);
                this.handleAuthSuccess(user);
            } else if (this.isGuest) {
                // Guest mode - allow access without authentication
                console.log('👤 Guest mode active');
                this.handleGuestAccess();
            } else {
                // User is signed out
                console.log('❌ User not authenticated');
                this.handleAuthLogout();
            }
        });
    }

    // Setup event listeners for forms and buttons
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Forgot password form
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }

        // Google Sign-In buttons - show "Coming Soon" message
        const googleBtns = document.querySelectorAll('.google-btn, #googleSignInBtn, #googleSignUpBtn');
        googleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showGoogleComingSoon());
        });

        // Guest buttons
        const guestBtns = document.querySelectorAll('.guest-btn');
        guestBtns.forEach(btn => {
            btn.addEventListener('click', () => this.continueAsGuest());
        });

        // Password strength checker
        const signupPassword = document.getElementById('signupPassword');
        if (signupPassword) {
            signupPassword.addEventListener('input', () => this.checkPasswordStrength());
        }

        // Confirm password validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    // Handle email/password login
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!this.validateEmail(email) || !password) {
            this.showMessage('Please enter valid email and password.', 'error');
            return;
        }

        this.showLoading('Signing you in...');

        try {
            // Set persistence based on remember me
            const persistence = rememberMe ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            await this.auth.setPersistence(persistence);
            
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Save user preferences
            if (rememberMe) {
                localStorage.setItem('breathemate_remember', 'true');
            }

            this.showMessage('✅ Login successful! Redirecting...', 'success');
            
            // User data will be handled by auth state listener
            
        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
        }
    }

    // Handle user signup
    async handleSignup(event) {
        event.preventDefault();
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!name || !this.validateEmail(email) || !password || !confirmPassword) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        if (!this.isPasswordStrong(password)) {
            this.showMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character.', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showMessage('Please accept the Terms of Service and Privacy Policy.', 'error');
            return;
        }

        this.showLoading('Creating your account...');

        try {
            // Create user account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update user profile with name
            await user.updateProfile({
                displayName: name
            });

            // Send email verification
            await user.sendEmailVerification();

            // Create user document in Firestore
            await this.createUserDocument(user, { name, email });

            this.showMessage('✅ Account created successfully! Please check your email for verification.', 'success');
            
        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
        }
    }

    // Handle password reset
    async handlePasswordReset(event) {
        event.preventDefault();
        
        const email = document.getElementById('resetEmail').value.trim();

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }

        this.showLoading('Sending password reset email...');

        try {
            await this.auth.sendPasswordResetEmail(email);
            
            this.hideLoading();
            this.showMessage('✅ Password reset email sent! Check your inbox.', 'success');
            
            // Show login form after successful reset request
            setTimeout(() => {
                this.showLogin();
            }, 2000);
            
        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
        }
    }

    // Show "Coming Soon" message for Google login
    showGoogleComingSoon() {
        this.showMessage('🚀 Google Sign-In coming soon! For now, please use email/password login or continue as guest.', 'info');
    }

    // Continue as guest
    continueAsGuest() {
        this.isGuest = true;
        this.showLoading('Setting up guest access...');
        
        // Create guest session
        const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        localStorage.setItem('breathemate_guest_mode', 'true');
        localStorage.setItem('breathemate_guest_id', guestId);
        localStorage.setItem('breathemate_username', 'Guest User');
        localStorage.setItem('breathemate_email', 'guest@breathemate.local');
        
        setTimeout(() => {
            this.hideLoading();
            this.showMessage('✅ Guest access granted! Limited features available.', 'info');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }, 1000);
    }

    // Create user document in Firestore
    async createUserDocument(user, additionalData = {}) {
        if (!user) return;

        const userRef = this.db.doc(`users/${user.uid}`);
        const snapshot = await userRef.get();

        if (!snapshot.exists) {
            const { name, email, photoURL, provider = 'email' } = additionalData;
            const userData = {
                uid: user.uid,
                name: name || user.displayName || 'User',
                email: email || user.email,
                photoURL: photoURL || user.photoURL || null,
                provider: provider,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                emailVerified: user.emailVerified,
                settings: {
                    notifications: {
                        dailyReminders: true,
                        healthAlerts: true,
                        weeklyReports: true
                    },
                    privacy: {
                        dataCollection: false,
                        shareWithDoctors: false
                    },
                    accessibility: {
                        darkMode: false,
                        highContrast: false,
                        fontSize: 'normal'
                    }
                },
                profiles: [],
                journalEntries: []
            };

            try {
                await userRef.set(userData);
                console.log('✅ User document created in Firestore');
            } catch (error) {
                console.error('❌ Error creating user document:', error);
            }
        } else {
            // Update last login time
            await userRef.update({
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    // Handle successful authentication
    async handleAuthSuccess(user) {
        try {
            // Load user data from Firestore
            const userDoc = await this.db.doc(`users/${user.uid}`).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Store user data in localStorage
                localStorage.setItem('breathemate_uid', user.uid);
                localStorage.setItem('breathemate_username', userData.name || user.displayName || 'User');
                localStorage.setItem('breathemate_email', user.email);
                localStorage.setItem('breathemate_email_verified', user.emailVerified.toString());
                localStorage.setItem('breathemate_photo_url', user.photoURL || '');
                localStorage.setItem('breathemate_provider', userData.provider || 'email');
                
                // Store settings if available
                if (userData.settings) {
                    localStorage.setItem('breathemate_settings', JSON.stringify(userData.settings));
                }
                
                // Store user profiles if available
                if (userData.profiles) {
                    localStorage.setItem('breathemate_user_profiles', JSON.stringify(userData.profiles));
                }
            } else {
                // Fallback if no Firestore document
                localStorage.setItem('breathemate_uid', user.uid);
                localStorage.setItem('breathemate_username', user.displayName || 'User');
                localStorage.setItem('breathemate_email', user.email);
                localStorage.setItem('breathemate_email_verified', user.emailVerified.toString());
            }
            
            this.hideLoading();
            
            // Check if we're on the login page
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
            this.hideLoading();
            // Still redirect on auth success, even if data loading fails
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    }

    // Handle guest access
    handleGuestAccess() {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    }

    // Handle authentication logout
    handleAuthLogout() {
        // Clear all stored data
        localStorage.removeItem('breathemate_uid');
        localStorage.removeItem('breathemate_username');
        localStorage.removeItem('breathemate_email');
        localStorage.removeItem('breathemate_email_verified');
        localStorage.removeItem('breathemate_photo_url');
        localStorage.removeItem('breathemate_provider');
        localStorage.removeItem('breathemate_guest_mode');
        localStorage.removeItem('breathemate_guest_id');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }

    // Sign out user
    async signOut() {
        try {
            this.isGuest = false;
            await this.auth.signOut();
            this.showMessage('✅ Successfully signed out.', 'success');
        } catch (error) {
            console.error('Sign out error:', error);
            this.showMessage('Error signing out. Please try again.', 'error');
        }
    }

    // Password strength checker
    checkPasswordStrength() {
        const password = document.getElementById('signupPassword').value;
        const strengthDiv = document.getElementById('passwordStrength');
        
        if (!strengthDiv) return;

        const strength = this.calculatePasswordStrength(password);
        
        strengthDiv.className = `password-strength ${strength.level}`;
        strengthDiv.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${strength.percentage}%"></div>
            </div>
            <span class="strength-text">${strength.text}</span>
        `;
    }

    // Calculate password strength
    calculatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;

        const levels = [
            { min: 0, level: 'very-weak', text: 'Very Weak', percentage: 20 },
            { min: 2, level: 'weak', text: 'Weak', percentage: 40 },
            { min: 3, level: 'fair', text: 'Fair', percentage: 60 },
            { min: 4, level: 'strong', text: 'Strong', percentage: 80 },
            { min: 6, level: 'very-strong', text: 'Very Strong', percentage: 100 }
        ];

        return levels.reverse().find(level => score >= level.min) || levels[0];
    }

    // Check if password is strong enough
    isPasswordStrong(password) {
        const minLength = 8;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        return password.length >= minLength && hasLower && hasUpper && hasNumbers && hasSpecial;
    }

    // Validate password match
    validatePasswordMatch() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');

        if (confirmPassword && password !== confirmPassword) {
            this.showInputError(confirmInput, 'Passwords do not match');
        } else {
            this.clearInputError(confirmInput);
        }
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Handle authentication errors
    handleAuthError(error) {
        console.error('Auth error:', error);
        
        let message = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address format.';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled. Please contact support.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Please check your connection.';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Sign-in was cancelled.';
                break;
            case 'auth/popup-blocked':
                message = 'Pop-up blocked. Please allow pop-ups and try again.';
                break;
        }
        
        this.showMessage(message, 'error');
    }

    // UI Helper Methods
    showLoading(text = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (overlay && loadingText) {
            loadingText.textContent = text;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
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
            zIndex: '10000',
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
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateY(-20px)';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 5000);
    }

    showInputError(input, message) {
        this.clearInputError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e53e3e';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        
        input.parentNode.parentNode.appendChild(errorDiv);
        input.style.borderColor = '#e53e3e';
    }

    clearInputError(input) {
        const errorMessage = input.parentNode.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        input.style.borderColor = '#e2e8f0';
    }
}

// Simple fallback authentication for when Firebase is unavailable
class SimplifiedAuth {
    constructor() {
        this.users = this.loadUsers();
        this.setupEventListeners();
    }

    loadUsers() {
        // Default demo users for testing
        const defaultUsers = {
            'demo@breathemate.com': {
                email: 'demo@breathemate.com',
                password: 'Demo123!',
                name: 'Demo User',
                verified: true
            },
            'test@example.com': {
                email: 'test@example.com',
                password: 'Test123!',
                name: 'Test User',
                verified: true
            }
        };

        // Load any additional users from localStorage
        const savedUsers = JSON.parse(localStorage.getItem('breathemate_local_users') || '{}');
        return { ...defaultUsers, ...savedUsers };
    }

    saveUsers() {
        localStorage.setItem('breathemate_local_users', JSON.stringify(this.users));
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleSimpleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSimpleSignup(e));
        }

        // Quick demo login
        const quickLoginBtn = document.querySelector('.quick-login-btn');
        if (quickLoginBtn) {
            quickLoginBtn.addEventListener('click', () => this.quickDemoLogin());
        }

        // Guest login
        const guestBtns = document.querySelectorAll('.guest-btn');
        guestBtns.forEach(btn => {
            btn.addEventListener('click', () => this.guestLogin());
        });

        // Google Sign-In buttons - show "Coming Soon" message
        const googleBtns = document.querySelectorAll('.google-btn, #googleSignInBtn, #googleSignUpBtn');
        googleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showGoogleComingSoon());
        });
    }

    // ...existing code...

    // Show "Coming Soon" message for Google login
    showGoogleComingSoon() {
        this.showMessage('🚀 Google Sign-In coming soon! For now, please use email/password login or continue as guest.', 'info');
    }
}

// Form switching functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    // Update header
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'BreatheMate';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Monitor Your Lung Health';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    // Update header
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'Join BreatheMate';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Create Your Health Account';
}

function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
    
    // Update header
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'Reset Password';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Recover Your Account';
}

// Password visibility toggles
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

function togglePasswordSignup() {
    const passwordInput = document.getElementById('signupPassword');
    const toggleIcon = document.getElementById('toggleIconSignup');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Continue as Guest function
function continueAsGuest() {
    if (window.breatheMateAuth) {
        window.breatheMateAuth.continueAsGuest();
    } else {
        // Fallback guest mode
        localStorage.setItem('breathemate_guest_mode', 'true');
        localStorage.setItem('breathemate_username', 'Guest User');
        localStorage.setItem('breathemate_email', 'guest@breathemate.local');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

// Quick login (demo mode)
function quickLogin() {
    // Auto-fill demo credentials
    document.getElementById('email').value = 'demo@breathemate.com';
    document.getElementById('password').value = 'Demo123!';
    document.getElementById('rememberMe').checked = true;
    
    if (window.breatheMateAuth) {
        window.breatheMateAuth.showMessage('Demo credentials loaded! Click Sign In or wait...', 'info');
        
        // Auto-submit after delay
        setTimeout(() => {
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }, 2000);
    }
}

// Placeholder functions for Terms and Privacy
function showTerms() {
    window.open('#', '_blank');
    // In a real app, this would open your terms of service page
}

function showPrivacy() {
    window.open('#', '_blank');
    // In a real app, this would open your privacy policy page
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Try Firebase first, then fallback to simplified auth
    setTimeout(() => {
        try {
            // Check if Firebase is available
            if (window.firebase && window.firebaseAuth) {
                window.breatheMateAuth = new BreatheMateAuth();
                console.log('🔐 BreatheMate Firebase Authentication Initialized');
            } else {
                throw new Error('Firebase not available');
            }
        } catch (error) {
            console.log('🔐 Firebase unavailable, using simplified authentication');
            window.breatheMateAuth = new SimplifiedAuth();
            console.log('🔐 BreatheMate Simplified Authentication Initialized');
        }
    }, 1000);
});

// Global sign out function for other pages
window.signOut = function() {
    if (window.breatheMateAuth && typeof window.breatheMateAuth.signOut === 'function') {
        window.breatheMateAuth.signOut();
    } else {
        // Fallback sign out
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
};