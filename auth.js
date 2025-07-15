/**
 * BreatheMate Standalone Authentication System
 * Simple, reliable login system that works without external dependencies
 */

class StandaloneAuth {
    constructor() {
        this.users = {
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
        
        this.initializeAuth();
    }

    initializeAuth() {
        console.log('🔐 Standalone Authentication System Loading...');
        this.setupEventListeners();
        
        // Show ready message after a short delay
        setTimeout(() => {
            this.showMessage('✅ Login system ready! Try demo login or guest access.', 'success');
        }, 1000);
    }

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

        // Quick demo login button
        const quickBtn = document.querySelector('.quick-login-btn');
        if (quickBtn) {
            quickBtn.addEventListener('click', () => this.quickDemo());
        }

        // Guest buttons
        const guestBtns = document.querySelectorAll('.guest-btn');
        guestBtns.forEach(btn => {
            btn.addEventListener('click', () => this.guestAccess());
        });

        // Google buttons (show coming soon)
        const googleBtns = document.querySelectorAll('.google-btn');
        googleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.googleComingSoon());
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        console.log('🔑 Attempting login for:', email);

        if (!email || !password) {
            this.showMessage('Please enter both email and password.', 'error');
            return;
        }

        this.showLoading('Logging you in...');

        // Simulate authentication delay
        setTimeout(() => {
            const user = this.users[email.toLowerCase()];
            
            if (!user) {
                this.hideLoading();
                this.showMessage('No account found with this email.', 'error');
                return;
            }

            if (user.password !== password) {
                this.hideLoading();
                this.showMessage('Incorrect password. Please try again.', 'error');
                return;
            }

            // Success!
            this.loginSuccess(user, rememberMe);
        }, 1500);
    }

    async handleSignup(event) {
        event.preventDefault();
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;

        // Validation
        if (!name || !email || !password) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters.', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showMessage('Please accept the terms and conditions.', 'error');
            return;
        }

        if (this.users[email.toLowerCase()]) {
            this.showMessage('An account with this email already exists.', 'error');
            return;
        }

        this.showLoading('Creating your account...');

        // Create account
        setTimeout(() => {
            const newUser = {
                email: email.toLowerCase(),
                password: password,
                name: name,
                verified: true,
                created: new Date().toISOString()
            };

            this.users[email.toLowerCase()] = newUser;
            this.saveUsers();

            this.showMessage('Account created successfully!', 'success');
            
            // Auto-login
            setTimeout(() => {
                this.loginSuccess(newUser, false);
            }, 1500);
        }, 1500);
    }

    quickDemo() {
        console.log('🚀 Quick demo login triggered');
        
        // Fill form
        const emailField = document.getElementById('email');
        const passwordField = document.getElementById('password');
        const rememberField = document.getElementById('rememberMe');

        if (emailField) emailField.value = 'demo@breathemate.com';
        if (passwordField) passwordField.value = 'Demo123!';
        if (rememberField) rememberField.checked = true;

        this.showMessage('Demo credentials loaded! Logging in...', 'info');

        // Auto-login demo user
        setTimeout(() => {
            this.loginSuccess(this.users['demo@breathemate.com'], true);
        }, 1000);
    }

    guestAccess() {
        console.log('👤 Guest access requested');
        this.showLoading('Setting up guest access...');
        
        const guestUser = {
            email: 'guest@breathemate.local',
            name: 'Guest User',
            isGuest: true,
            verified: true
        };

        setTimeout(() => {
            this.loginSuccess(guestUser, false);
        }, 1000);
    }

    googleComingSoon() {
        this.showMessage('🚀 Google Sign-In coming soon! Please use email login or guest access for now.', 'info');
    }

    loginSuccess(user, rememberMe) {
        console.log('✅ Login successful for:', user.name);
        
        // Store user data
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem('breathemate_email', user.email);
        storage.setItem('breathemate_username', user.name);
        storage.setItem('breathemate_logged_in', 'true');
        storage.setItem('breathemate_email_verified', user.verified.toString());
        
        if (user.isGuest) {
            storage.setItem('breathemate_guest_mode', 'true');
            storage.setItem('breathemate_guest_id', 'guest_' + Date.now());
        }

        this.hideLoading();
        this.showMessage(`Welcome, ${user.name}! Redirecting to dashboard...`, 'success');
        
        // Redirect
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    saveUsers() {
        try {
            localStorage.setItem('breathemate_local_users', JSON.stringify(this.users));
        } catch (error) {
            console.log('Could not save users:', error);
        }
    }

    // UI Methods
    showLoading(text = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (overlay) {
            overlay.style.display = 'flex';
            if (loadingText) loadingText.textContent = text;
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showMessage(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Remove existing messages
        const existing = document.querySelector('.standalone-message');
        if (existing) existing.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `standalone-message ${type}`;
        messageDiv.textContent = message;
        
        // Styling
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            zIndex: '10001',
            maxWidth: '350px',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        });
        
        // Colors by type
        const colors = {
            success: '#10b981',
            error: '#ef4444', 
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        messageDiv.style.background = colors[type] || colors.info;
        
        document.body.appendChild(messageDiv);
        
        // Animate in
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
        
        // Auto-remove
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateY(-20px)';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 5000);
    }

    // Sign out method
    signOut() {
        localStorage.clear();
        sessionStorage.clear();
        this.showMessage('Signed out successfully.', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Form switching functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) forgotForm.style.display = 'none';
    
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'BreatheMate';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Monitor Your Lung Health';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) forgotForm.style.display = 'none';
    
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'Join BreatheMate';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Create Your Health Account';
}

function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) forgotForm.style.display = 'block';
    
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'Reset Password';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Recover Your Account';
}

// Password visibility toggles
function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('toggleIcon');
    
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
}

function togglePasswordSignup() {
    const input = document.getElementById('signupPassword');
    const icon = document.getElementById('toggleIconSignup');
    
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
}

// Global functions
function continueAsGuest() {
    if (window.standaloneAuth) {
        window.standaloneAuth.guestAccess();
    }
}

function quickLogin() {
    if (window.standaloneAuth) {
        window.standaloneAuth.quickDemo();
    }
}

function showTerms() {
    alert('Terms of Service: By using BreatheMate, you agree to our terms and conditions.');
}

function showPrivacy() {
    alert('Privacy Policy: We protect your health data with enterprise-grade security.');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Initializing Standalone Authentication...');
    window.standaloneAuth = new StandaloneAuth();
    
    // Global sign out function
    window.signOut = function() {
        if (window.standaloneAuth) {
            window.standaloneAuth.signOut();
        }
    };
    
    console.log('✅ Standalone Authentication Ready!');
});

// Export for other pages
window.StandaloneAuth = StandaloneAuth;