import emailVerificationService from './email-service.js';

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
    
    const usernameError = document.getElementById('username-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    
    const strengthIndicator = document.querySelector('.password-strength');
    const signupButton = document.querySelector('.login-btn');

    // Validation functions
    function validateUsername(username) {
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePassword(password) {
        const minLength = 12;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: password.length >= minLength && 
                     hasUpperCase && 
                     hasLowerCase && 
                     hasNumbers && 
                     hasSpecialChar,
            requirements: []
        };
    }

    function updateStrengthIndicator(password) {
        strengthIndicator.className = 'password-strength';
        if (password.length === 0) return;

        let strength = 0;
        if (password.length >= 12) strength += 2;
        if (password.length >= 15) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 2;

        if (strength <= 4) {
            strengthIndicator.classList.add('weak');
        } else if (strength <= 7) {
            strengthIndicator.classList.add('medium');
        } else {
            strengthIndicator.classList.add('strong');
        }
    }

    // Real-time validation
    usernameInput.addEventListener('input', function() {
        const username = this.value.trim();
        if (!validateUsername(username)) {
            usernameError.textContent = '3-20 characters, letters, numbers, and underscores only';
            this.classList.add('error');
        } else {
            usernameError.textContent = '';
            this.classList.remove('error');
        }
    });

    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (!validateEmail(email)) {
            emailError.textContent = 'Please enter a valid email address';
            this.classList.add('error');
        } else {
            emailError.textContent = '';
            this.classList.remove('error');
        }
    });

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const validation = validatePassword(password);
        
        updateStrengthIndicator(password);

        if (!validation.isValid) {
            passwordError.innerHTML = 'Password requirements:<br>' + 
                '• At least 12 characters<br>' +
                '• One uppercase letter<br>' +
                '• One lowercase letter<br>' +
                '• One number<br>' +
                '• One special character';
            this.classList.add('error');
        } else {
            passwordError.textContent = '';
            this.classList.remove('error');
        }

        // Validate confirm password if it's not empty
        if (confirmPasswordInput.value) {
            if (password !== confirmPasswordInput.value) {
                confirmPasswordError.textContent = 'Passwords do not match';
                confirmPasswordInput.classList.add('error');
            } else {
                confirmPasswordError.textContent = '';
                confirmPasswordInput.classList.remove('error');
            }
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        const confirmPassword = this.value;
        const password = passwordInput.value;

        if (confirmPassword !== password) {
            confirmPasswordError.textContent = 'Passwords do not match';
            this.classList.add('error');
        } else {
            confirmPasswordError.textContent = '';
            this.classList.remove('error');
        }
    });

    // Form submission
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all inputs
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        let isValid = true;

        // Username validation
        if (!validateUsername(username)) {
            usernameError.textContent = '3-20 characters, letters, numbers, and underscores only';
            usernameInput.classList.add('error');
            isValid = false;
        }

        // Email validation
        if (!validateEmail(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.classList.add('error');
            isValid = false;
        }

        // Password validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            passwordError.textContent = 'Password does not meet requirements';
            passwordInput.classList.add('error');
            isValid = false;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            confirmPasswordError.textContent = 'Passwords do not match';
            confirmPasswordInput.classList.add('error');
            isValid = false;
        }

        // Terms agreement
        if (!termsCheckbox.checked) {
            alert('Please agree to the Terms of Service');
            isValid = false;
        }

        // If all validations pass
        if (isValid) {
            try {
                // Register user
                signupButton.disabled = true;
                signupButton.textContent = 'Signing Up...';

                const result = await emailVerificationService.registerUser(email, password);

                // Simulate successful registration
                setTimeout(() => {
                    alert('Registration Successful!');
                    // In a real app, redirect to dashboard or login
                    window.location.href = 'index.html';
                }, 1500);

            } catch (error) {
                // Handle registration errors
                emailError.textContent = error.message || 'Registration failed. Please try again.';
                signupButton.disabled = false;
                signupButton.textContent = 'Sign Up';
            }
        }
    });
});
