// Comprehensive Form Validation Module

class FormValidator {
    constructor() {
        // Validation patterns
        this.patterns = {
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            name: /^[a-zA-Z\s]{2,50}$/,
            otp: /^\d{6}$/
        };

        // Error messages
        this.errorMessages = {
            email: 'Please enter a valid email address',
            password: 'Password must be 8+ chars, include uppercase, lowercase, number, and special character',
            confirmPassword: 'Passwords do not match',
            name: 'Name must be 2-50 characters, letters only',
            otp: 'OTP must be 6 digits',
            required: 'This field is required'
        };
    }

    // Validate individual field
    validateField(input, type) {
        // Remove previous error states
        this.clearError(input);

        // Check if field is required
        if (input.hasAttribute('required') && !input.value.trim()) {
            return this.setError(input, this.errorMessages.required);
        }

        // Skip validation for empty non-required fields
        if (!input.hasAttribute('required') && !input.value.trim()) {
            return true;
        }

        // Type-specific validations
        switch(type) {
            case 'email':
                return this.validateEmail(input);
            case 'password':
                return this.validatePassword(input);
            case 'confirm-password':
                return this.validateConfirmPassword(input);
            case 'name':
                return this.validateName(input);
            case 'otp':
                return this.validateOTP(input);
            default:
                return true;
        }
    }

    // Email validation
    validateEmail(input) {
        if (!this.patterns.email.test(input.value)) {
            return this.setError(input, this.errorMessages.email);
        }
        return true;
    }

    // Password validation
    validatePassword(input) {
        if (!this.patterns.password.test(input.value)) {
            return this.setError(input, this.errorMessages.password);
        }
        return true;
    }

    // Confirm password validation
    validateConfirmPassword(input) {
        const passwordInput = input.closest('form').querySelector('input[type="password"]:not([name="confirm-password"])');
        if (passwordInput && input.value !== passwordInput.value) {
            return this.setError(input, this.errorMessages.confirmPassword);
        }
        return true;
    }

    // Name validation
    validateName(input) {
        if (!this.patterns.name.test(input.value)) {
            return this.setError(input, this.errorMessages.name);
        }
        return true;
    }

    // OTP validation
    validateOTP(input) {
        if (!this.patterns.otp.test(input.value)) {
            return this.setError(input, this.errorMessages.otp);
        }
        return true;
    }

    // Set error state
    setError(input, message) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            // Create or update error message
            let errorElement = formGroup.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                input.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
            
            // Add error styling
            input.classList.add('invalid');
            input.setAttribute('aria-invalid', 'true');
        }
        return false;
    }

    // Clear error state
    clearError(input) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = '';
            }
            input.classList.remove('invalid');
            input.removeAttribute('aria-invalid');
        }
    }

    // Validate entire form
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input');
        
        inputs.forEach(input => {
            const validationType = input.getAttribute('data-validate');
            if (validationType) {
                if (!this.validateField(input, validationType)) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // Attach event listeners
    attachValidation(form) {
        // Real-time validation on input
        form.querySelectorAll('input').forEach(input => {
            const validationType = input.getAttribute('data-validate');
            if (validationType) {
                input.addEventListener('input', () => {
                    this.validateField(input, validationType);
                });
                
                input.addEventListener('blur', () => {
                    this.validateField(input, validationType);
                });
            }
        });

        // Form submission validation
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
            }
        });
    }
}

// Initialize validator for all forms
document.addEventListener('DOMContentLoaded', () => {
    const validator = new FormValidator();
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        validator.attachValidation(form);
    });
});

// Export for potential module usage
export default FormValidator;
