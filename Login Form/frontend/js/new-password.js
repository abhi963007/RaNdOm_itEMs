document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('newPasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const passwordError = document.getElementById('password-error');
    const confirmError = document.getElementById('confirm-password-error');
    const submitButton = document.querySelector('.login-btn');
    const successMessage = document.querySelector('.success-message');
    const strengthIndicator = document.querySelector('.password-strength');

    // Get email from URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (!email) {
        // Redirect if no email is present
        alert('Invalid access. Please start the reset process again.');
        window.location.href = 'forgot-password.html';
    }

    let passwordValid = false;
    let confirmValid = false;

    // Enhanced password validation with more secure requirements
    function validatePassword(password) {
        const minLength = 12;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNoSpaces = !/\s/.test(password);
        const hasNoRepeatingChars = !/(.)\1{2,}/.test(password);
        const isNotCommon = !isCommonPassword(password);

        const requirements = [];
        if (password.length < minLength) requirements.push(`At least ${minLength} characters`);
        if (!hasUpperCase) requirements.push('One uppercase letter');
        if (!hasLowerCase) requirements.push('One lowercase letter');
        if (!hasNumbers) requirements.push('One number');
        if (!hasSpecialChar) requirements.push('One special character');
        if (!hasNoSpaces) requirements.push('No spaces allowed');
        if (!hasNoRepeatingChars) requirements.push('No repeating characters');
        if (!isNotCommon) requirements.push('Password too common');

        return {
            isValid: requirements.length === 0,
            requirements
        };
    }

    // Check for common passwords
    function isCommonPassword(password) {
        const commonPasswords = [
            'password123', 'qwerty123', '12345678', 'admin123',
            'welcome123', 'letmein123', 'monkey123', 'football123'
        ];
        return commonPasswords.includes(password.toLowerCase());
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
        if (!/(.)\1{2,}/.test(password)) strength += 1;
        if (!/\s/.test(password)) strength += 1;

        if (strength <= 4) {
            strengthIndicator.classList.add('weak');
        } else if (strength <= 7) {
            strengthIndicator.classList.add('medium');
        } else {
            strengthIndicator.classList.add('strong');
        }

        // Add pulsing animation for weak passwords
        if (strength <= 4) {
            strengthIndicator.classList.add('pulse');
        } else {
            strengthIndicator.classList.remove('pulse');
        }
    }

    function updateSubmitButton() {
        submitButton.disabled = !(passwordValid && confirmValid);
        if (submitButton.disabled) {
            submitButton.classList.remove('ready');
        } else {
            submitButton.classList.add('ready');
        }
    }

    passwordInput.addEventListener('input', function() {
        const validation = validatePassword(this.value);
        updateStrengthIndicator(this.value);

        if (!validation.isValid) {
            passwordValid = false;
            passwordError.innerHTML = 'Requirements:<br>' + validation.requirements.map(req => 
                `<span class="requirement">• ${req}</span>`
            ).join('<br>');
            this.parentElement.classList.add('error');
        } else {
            passwordValid = true;
            passwordError.textContent = '';
            this.parentElement.classList.remove('error');
            this.parentElement.classList.add('success');
        }

        if (confirmInput.value) {
            if (this.value !== confirmInput.value) {
                confirmValid = false;
                confirmError.textContent = 'Passwords do not match';
                confirmInput.parentElement.classList.add('error');
                confirmInput.parentElement.classList.remove('success');
            } else {
                confirmValid = true;
                confirmError.textContent = '';
                confirmInput.parentElement.classList.remove('error');
                confirmInput.parentElement.classList.add('success');
            }
        }

        updateSubmitButton();
    });

    confirmInput.addEventListener('input', function() {
        if (this.value !== passwordInput.value) {
            confirmValid = false;
            confirmError.textContent = 'Passwords do not match';
            this.parentElement.classList.add('error');
            this.parentElement.classList.remove('success');
        } else {
            confirmValid = true;
            confirmError.textContent = '';
            this.parentElement.classList.remove('error');
            this.parentElement.classList.add('success');
        }

        updateSubmitButton();
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (passwordValid && confirmValid) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span>Updating...';

            try {
                // Simulate password reset (replace with actual backend call)
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Here you would typically send the new password to your backend
                // along with the email for verification
                console.log('Resetting password for:', email);
                console.log('New password set successfully');

                successMessage.classList.add('show');
                submitButton.textContent = 'Password Updated';

                // Redirect to login page after success
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } catch (error) {
                console.error('Password reset failed:', error);
                submitButton.disabled = false;
                submitButton.textContent = 'Update Password';
                passwordError.textContent = 'Failed to update password. Please try again.';
            }
        }
    });
});
