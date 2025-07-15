// Login form functionality - Enhanced with Firebase Auth
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already authenticated
    checkAuthState();
    
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Form submission is now handled by auth.js
    // Keep existing validation functions for compatibility
    
    // Input validation
    if (emailInput) emailInput.addEventListener('blur', validateEmail);
    if (passwordInput) passwordInput.addEventListener('input', validatePassword);
    
    // Load saved credentials if remember me was checked
    loadSavedCredentials();
});

// Check authentication state on page load
function checkAuthState() {
    // Check for guest mode
    const isGuest = localStorage.getItem('breathemate_guest_mode') === 'true';
    const userEmail = localStorage.getItem('breathemate_email');
    
    if (isGuest || userEmail) {
        // User is already authenticated or in guest mode
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            // Redirect to dashboard if on login page
            window.location.href = 'dashboard.html';
        }
    }
}

// Password visibility toggle (kept for compatibility)
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput && toggleIcon) {
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
}

// Email validation (enhanced)
function validateEmail() {
    const email = document.getElementById('email');
    if (!email) return true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email.value)) {
        showInputError(email, 'Please enter a valid email address');
        return false;
    } else {
        clearInputError(email);
        return true;
    }
}

// Password validation (enhanced)
function validatePassword() {
    const password = document.getElementById('password');
    if (!password) return true;
    
    if (password.value.length < 6) {
        showInputError(password, 'Password must be at least 6 characters');
        return false;
    } else {
        clearInputError(password);
        return true;
    }
}

// Show input error (enhanced)
function showInputError(input, message) {
    clearInputError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e53e3e';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    
    input.parentNode.parentNode.appendChild(errorDiv);
    input.style.borderColor = '#e53e3e';
    input.classList.add('error');
}

// Clear input error (enhanced)
function clearInputError(input) {
    const errorMessage = input.parentNode.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    input.style.borderColor = '#e2e8f0';
    input.classList.remove('error');
}

// Legacy login handler (now deferred to Firebase Auth)
async function handleLogin() {
    console.log('Login handled by Firebase Auth system');
    // This function is now handled by the BreatheMateAuth class in auth.js
    // Keeping for backward compatibility
}

// Enhanced quick login with Firebase demo account
function quickLogin() {
    // Auto-fill demo credentials that work with Firebase
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');
    
    if (emailInput && passwordInput) {
        emailInput.value = 'demo@breathemate.com';
        passwordInput.value = 'Demo123!';
        if (rememberMe) rememberMe.checked = true;
        
        // Show message using Firebase Auth system if available
        if (window.breatheMateAuth) {
            window.breatheMateAuth.showMessage('Demo credentials loaded! Click Sign In or wait...', 'info');
            
            // Auto-submit after delay
            setTimeout(() => {
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }, 2000);
        } else {
            // Fallback message
            showMessage('Demo credentials loaded! Click Sign In to continue.', 'success');
        }
    }
}

// Legacy show loading state
function showLoadingState(button) {
    if (button) {
        button.disabled = true;
        button.classList.add('loading');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.dataset.originalText = originalText;
    }
}

// Legacy hide loading state
function hideLoadingState(button) {
    if (button) {
        button.disabled = false;
        button.classList.remove('loading');
        const originalText = button.dataset.originalText;
        if (originalText) {
            button.innerHTML = originalText;
        }
    }
}

// Legacy show success message
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// Legacy show error message
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// Enhanced message system (fallback if Firebase Auth not loaded)
function showMessage(message, type = 'info') {
    // Use Firebase Auth message system if available
    if (window.breatheMateAuth) {
        window.breatheMateAuth.showMessage(message, type);
        return;
    }
    
    // Fallback message system
    const existingMessage = document.querySelector('.legacy-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `legacy-message ${type}`;
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
        default:
            styles.background = '#3182ce';
            break;
    }
    
    Object.assign(messageDiv.style, styles);
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Save credentials to localStorage (enhanced for Firebase)
function saveCredentials(email, password) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('breathemate_email', email);
        localStorage.setItem('breathemate_remember', 'true');
        // Note: Never store passwords in production - this is demo only
    }
}

// Load saved credentials (enhanced)
function loadSavedCredentials() {
    if (typeof(Storage) !== "undefined") {
        const savedEmail = localStorage.getItem('breathemate_email');
        const rememberMe = localStorage.getItem('breathemate_remember');
        
        if (savedEmail && rememberMe === 'true') {
            const emailInput = document.getElementById('email');
            const rememberCheckbox = document.getElementById('rememberMe');
            
            if (emailInput) emailInput.value = savedEmail;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }
}

// Clear saved credentials
function clearSavedCredentials() {
    if (typeof(Storage) !== "undefined") {
        localStorage.removeItem('breathemate_email');
        localStorage.removeItem('breathemate_remember');
    }
}

// Enhanced Google sign-in placeholder (now handled by Firebase)
document.addEventListener('DOMContentLoaded', function() {
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn && !window.firebaseAuth) {
        // Use demo Google Sign-In if Firebase not loaded
        googleBtn.addEventListener('click', function() {
            demoGoogleSignIn();
        });
    }
});

// Enhanced signup functionality
function showSignup() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
    
    // Update header
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'Join BreatheMate';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Create Your Health Account';
}

// Enhanced forgot password functionality
function showForgotPassword() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'block';
    
    // Update header
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'Reset Password';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Recover Your Account';
}

// Show login form
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
    
    // Update header
    const header = document.querySelector('.login-header h1');
    if (header) header.textContent = 'BreatheMate';
    
    const tagline = document.querySelector('.tagline');
    if (tagline) tagline.textContent = 'Monitor Your Lung Health';
}

// Continue as guest (enhanced)
function continueAsGuest() {
    if (window.breatheMateAuth) {
        window.breatheMateAuth.continueAsGuest();
    } else {
        // Fallback demo mode
        localStorage.setItem('breathemate_guest_mode', 'true');
        localStorage.setItem('breathemate_username', 'Demo User');
        localStorage.setItem('breathemate_email', 'demo@breathemate.local');
        
        showMessage('Demo mode activated! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
}

// Demo Google Sign-In (when Firebase not configured)
function demoGoogleSignIn() {
    showMessage('Setting up demo Google account...', 'info');
    
    // Simulate Google sign-in
    localStorage.setItem('breathemate_username', 'Demo Google User');
    localStorage.setItem('breathemate_email', 'demo.google@breathemate.com');
    localStorage.setItem('breathemate_provider', 'google');
    
    setTimeout(() => {
        showMessage('✅ Demo Google Sign-In successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 1000);
}

// Forgot password handler (enhanced)
document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.breatheMateAuth) {
                showForgotPassword();
            } else {
                showMessage('Password reset functionality requires Firebase configuration!', 'warning');
            }
        });
    }
});

// Enhanced smooth animations for form interactions
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentNode) {
                this.parentNode.style.transform = 'scale(1.02)';
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.parentNode) {
                this.parentNode.style.transform = 'scale(1)';
            }
        });
    });
});

// Enhanced keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            const form = activeElement.closest('form');
            if (form) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        }
    }
    
    // ESC to close modals or return to login
    if (e.key === 'Escape') {
        const signupForm = document.getElementById('signupForm');
        const forgotForm = document.getElementById('forgotPasswordForm');
        
        if (signupForm && signupForm.style.display !== 'none') {
            showLogin();
        } else if (forgotForm && forgotForm.style.display !== 'none') {
            showLogin();
        }
    }
});

// Initialize authentication monitoring
document.addEventListener('DOMContentLoaded', function() {
    // Monitor for Firebase Auth initialization
    let checkCount = 0;
    const checkFirebase = setInterval(() => {
        checkCount++;
        
        if (window.firebaseAuth && window.breatheMateAuth) {
            console.log('✅ Firebase Authentication System Ready');
            clearInterval(checkFirebase);
            
            // Show Firebase status
            setTimeout(() => {
                if (window.breatheMateAuth) {
                    window.breatheMateAuth.showMessage('🔐 Secure authentication enabled', 'success');
                }
            }, 2000);
            
        } else if (checkCount > 10) {
            // Firebase failed to load
            console.warn('⚠️ Firebase Authentication not available - using fallback mode');
            clearInterval(checkFirebase);
            
            showMessage('Running in demo mode - Firebase authentication not configured', 'warning');
        }
    }, 500);
});