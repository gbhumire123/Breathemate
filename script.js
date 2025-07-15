// Login form functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Form submission handler
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Input validation
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    
    // Load saved credentials if remember me was checked
    loadSavedCredentials();
});

// Password visibility toggle
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

// Email validation
function validateEmail() {
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email.value)) {
        showInputError(email, 'Please enter a valid email address');
        return false;
    } else {
        clearInputError(email);
        return true;
    }
}

// Password validation
function validatePassword() {
    const password = document.getElementById('password');
    
    if (password.value.length < 6) {
        showInputError(password, 'Password must be at least 6 characters');
        return false;
    } else {
        clearInputError(password);
        return true;
    }
}

// Show input error
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
}

// Clear input error
function clearInputError(input) {
    const errorMessage = input.parentNode.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    input.style.borderColor = '#e2e8f0';
}

// Handle login submission
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginBtn = document.querySelector('.login-btn');
    
    // Validate inputs
    if (!validateEmail() || !validatePassword()) {
        return;
    }
    
    // Show loading state
    showLoadingState(loginBtn);
    
    try {
        // Simulate API call (replace with actual backend endpoint)
        const response = await simulateLogin(email, password);
        
        if (response.success) {
            // Save credentials if remember me is checked
            if (rememberMe) {
                saveCredentials(email, password);
            } else {
                clearSavedCredentials();
            }
            
            // Save user data for dashboard
            localStorage.setItem('breathemate_username', response.user.name || 'Demo User');
            
            // Show success message
            showSuccessMessage('Login successful! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        hideLoadingState(loginBtn);
    }
}

// Simulate login API call (replace with actual API integration)
async function simulateLogin(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Demo credentials for testing
            if (email === 'demo@breathemate.com' && password === 'demo1234') {
                resolve({ success: true, user: { email, name: 'Demo User' } });
            } else {
                resolve({ success: false, message: 'Invalid email or password' });
            }
        }, 1000);
    });
}

// Quick login function
function quickLogin() {
    // Auto-fill the demo credentials
    document.getElementById('email').value = 'demo@breathemate.com';
    document.getElementById('password').value = 'demo1234';
    
    // Check remember me
    document.getElementById('rememberMe').checked = true;
    
    // Show quick login message
    showMessage('Demo credentials loaded! Click Sign In to continue.', 'success');
    
    // Optional: Auto-submit after a brief delay
    setTimeout(() => {
        handleLogin();
    }, 1500);
}

// Show loading state
function showLoadingState(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    button.classList.add('loading');
}

// Hide loading state
function hideLoadingState(button) {
    button.disabled = false;
    button.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
    button.classList.remove('loading');
}

// Show success message
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// Show message
function showMessage(message, type) {
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
        transition: 'all 0.3s ease'
    };
    
    if (type === 'success') {
        styles.background = '#38a169';
    } else {
        styles.background = '#e53e3e';
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

// Save credentials to localStorage
function saveCredentials(email, password) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('breathemate_email', email);
        // Note: In production, never store passwords in localStorage
        // This is for demo purposes only
        localStorage.setItem('breathemate_remember', 'true');
    }
}

// Load saved credentials
function loadSavedCredentials() {
    if (typeof(Storage) !== "undefined") {
        const savedEmail = localStorage.getItem('breathemate_email');
        const rememberMe = localStorage.getItem('breathemate_remember');
        
        if (savedEmail && rememberMe === 'true') {
            document.getElementById('email').value = savedEmail;
            document.getElementById('rememberMe').checked = true;
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

// Google sign-in (placeholder)
document.addEventListener('DOMContentLoaded', function() {
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            showMessage('Google Sign-In integration coming soon!', 'success');
        });
    }
});

// Show signup form (placeholder)
function showSignup() {
    showMessage('Sign-up page coming soon! For demo, use: demo@breathemate.com / demo123', 'success');
}

// Forgot password handler
document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('Password reset functionality coming soon!', 'success');
        });
    }
});

// Add smooth animations for form interactions
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'scale(1)';
        });
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT') {
            const form = activeElement.closest('form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    }
});