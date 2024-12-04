import emailVerificationService from './email-service.js';

document.addEventListener('DOMContentLoaded', function() {
    const emailStep = document.getElementById('emailStep');
    const otpStep = document.getElementById('otpStep');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const otpInputs = document.querySelectorAll('.code-input');
    const otpError = document.getElementById('otp-error');
    const timerElement = document.getElementById('timer');
    const resendLink = document.querySelector('.resend-link');
    const resendOtpBtn = document.getElementById('resendOtp');

    let email = '';
    let timer = 180;
    let timerInterval;

    // Email validation function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Start OTP timer
    function startOtpTimer() {
        timer = 180;
        timerElement.textContent = timer;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer--;
            timerElement.textContent = timer;
            
            if (timer <= 0) {
                clearInterval(timerInterval);
                resendLink.style.display = 'block';
                timerElement.parentElement.style.display = 'none';
            }
        }, 1000);
    }

    // Send OTP
    sendOtpBtn.addEventListener('click', async function() {
        const emailValue = emailInput.value.trim();
        
        // Validate email
        if (!validateEmail(emailValue)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.classList.add('error');
            return;
        }

        // Clear previous errors
        emailError.textContent = '';
        emailInput.classList.remove('error');

        try {
            // Send verification email
            const result = await emailVerificationService.sendVerificationEmail(emailValue);
            
            if (result.success) {
                // Switch to OTP step
                email = emailValue;
                emailStep.style.display = 'none';
                otpStep.style.display = 'block';
                
                // Start timer
                startOtpTimer();
            }
        } catch (error) {
            emailError.textContent = 'Failed to send verification code. Please try again.';
        }
    });

    // OTP Input Handling
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Auto move to next input
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            // Enable verify button if all inputs are filled
            const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
            verifyOtpBtn.disabled = !allFilled;
        });

        // Handle backspace to move to previous input
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    // Verify OTP
    verifyOtpBtn.addEventListener('click', function() {
        const otpCode = Array.from(otpInputs).map(input => input.value).join('');
        
        try {
            // Verify the OTP
            const isValid = emailVerificationService.verifyOTP(email, otpCode);
            
            if (isValid) {
                // Clear the verification code
                emailVerificationService.clearVerificationCode(email);
                
                // Redirect to new password page
                window.location.href = `new-password.html?email=${encodeURIComponent(email)}`;
            } else {
                otpError.textContent = 'Invalid verification code. Please try again.';
                otpInputs.forEach(input => {
                    input.value = '';
                    input.classList.add('error');
                });
                verifyOtpBtn.disabled = true;
            }
        } catch (error) {
            otpError.textContent = 'Verification failed. Please try again.';
        }
    });

    // Resend OTP
    resendOtpBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        try {
            // Resend verification email
            const result = await emailVerificationService.sendVerificationEmail(email);
            
            if (result.success) {
                // Reset timer
                startOtpTimer();
                
                // Hide resend link
                resendLink.style.display = 'none';
                timerElement.parentElement.style.display = 'block';
                
                // Clear previous error
                otpError.textContent = '';
                
                // Reset OTP inputs
                otpInputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('error');
                });
                verifyOtpBtn.disabled = true;
            }
        } catch (error) {
            otpError.textContent = 'Failed to resend verification code. Please try again.';
        }
    });
});
