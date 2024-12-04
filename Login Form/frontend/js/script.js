import emailVerificationService from './email-service.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const loginButton = document.querySelector('.login-btn');

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Password validation
    function validatePassword(password) {
        // Basic validation - can be expanded
        return password.length >= 8;
    }

    // Input validation
    function validateInputs() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        let isValid = true;

        // Email validation
        if (!validateEmail(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.classList.add('error');
            isValid = false;
        } else {
            emailError.textContent = '';
            emailInput.classList.remove('error');
        }

        // Password validation
        if (!validatePassword(password)) {
            passwordError.textContent = 'Password must be at least 8 characters long';
            passwordInput.classList.add('error');
            isValid = false;
        } else {
            passwordError.textContent = '';
            passwordInput.classList.remove('error');
        }

        return isValid;
    }

    // Real login logic would involve backend authentication
    async function handleLogin(e) {
        e.preventDefault();

        // Validate inputs
        if (!validateInputs()) {
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
            // In a real app, this would be a backend login request
            // For now, we'll use the registration method to simulate login
            const result = await emailVerificationService.registerUser(email, password);

            // Simulate successful login
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';

            // Redirect or show success message
            setTimeout(() => {
                alert('Login Successful!');
                // In a real app, redirect to dashboard or home page
                // window.location.href = '/dashboard';
            }, 1500);

        } catch (error) {
            // Handle login errors
            passwordError.textContent = error.message || 'Login failed. Please try again.';
            loginButton.textContent = 'Sign In';
        }
    }

    // Real-time input validation
    emailInput.addEventListener('input', validateInputs);
    passwordInput.addEventListener('input', validateInputs);

    // Form submission
    loginForm.addEventListener('submit', handleLogin);
});
