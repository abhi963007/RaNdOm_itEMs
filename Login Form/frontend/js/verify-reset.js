document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('verifyForm');
    const inputs = document.querySelectorAll('.code-input');
    const verifyButton = document.querySelector('.login-btn');
    const errorMessage = document.getElementById('code-error');
    const successMessage = document.querySelector('.success-message');
    const timerElement = document.getElementById('timer');
    const resendLink = document.querySelector('.resend-link');
    
    // Increased timer duration to 3 minutes
    let timer = 180;
    let timerInterval;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    const LOCKOUT_DURATION = 900000; // 15 minutes in milliseconds
    let lastAttempt = 0;

    // Format time as MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Start timer with animation
    function startTimer() {
        timer = 180;
        resendLink.style.display = 'none';
        timerElement.parentElement.style.display = 'block';
        
        timerInterval = setInterval(() => {
            timer--;
            timerElement.textContent = formatTime(timer);
            
            // Add warning class when less than 30 seconds remain
            if (timer <= 30) {
                timerElement.classList.add('warning');
            }
            
            if (timer <= 0) {
                clearInterval(timerInterval);
                resendLink.style.display = 'block';
                timerElement.parentElement.style.display = 'none';
                timerElement.classList.remove('warning');
                
                // Clear inputs when code expires
                inputs.forEach(input => {
                    input.value = '';
                    input.disabled = true;
                });
                verifyButton.disabled = true;
                errorMessage.textContent = 'Code expired. Please request a new one.';
            }
        }, 1000);
    }

    function checkRateLimit() {
        const now = Date.now();
        if (attempts >= MAX_ATTEMPTS) {
            const timeLeft = LOCKOUT_DURATION - (now - lastAttempt);
            if (timeLeft > 0) {
                const minutes = Math.ceil(timeLeft / 60000);
                throw new Error(`Too many attempts. Please try again in ${minutes} minutes.`);
            } else {
                attempts = 0;
            }
        }
        lastAttempt = now;
        attempts++;
    }

    // Initialize timer
    startTimer();

    // Handle input focus and auto-tab with enhanced validation
    inputs.forEach((input, index) => {
        input.addEventListener('keyup', function(e) {
            const currentInput = this;
            const nextInput = inputs[index + 1];
            const prevInput = inputs[index - 1];

            // Clear any non-numeric input
            currentInput.value = currentInput.value.replace(/[^0-9]/g, '');

            // Add success animation when filled
            if (currentInput.value.length === 1) {
                currentInput.classList.add('filled');
            } else {
                currentInput.classList.remove('filled');
            }

            if (currentInput.value.length > 0) {
                if (nextInput) {
                    nextInput.focus();
                    nextInput.select();
                }
            } else if (e.key === 'Backspace' && prevInput) {
                prevInput.focus();
                prevInput.select();
            }

            verifyButton.disabled = !isCodeComplete();
            if (!verifyButton.disabled) {
                verifyButton.classList.add('ready');
            } else {
                verifyButton.classList.remove('ready');
            }
        });

        // Prevent default backspace behavior
        input.addEventListener('keydown', function(e) {
            const currentInput = this;
            const prevInput = inputs[index - 1];

            if (e.key === 'Backspace' && !currentInput.value && prevInput) {
                e.preventDefault();
                prevInput.value = '';
                prevInput.focus();
                prevInput.classList.remove('filled');
            }
        });

        // Select all text on focus
        input.addEventListener('focus', function() {
            this.select();
        });
    });

    // Paste handling for the entire code
    document.addEventListener('paste', function(e) {
        if (!e.target.classList.contains('code-input')) return;
        
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
        
        inputs.forEach((input, index) => {
            if (pastedData[index]) {
                input.value = pastedData[index];
                input.classList.add('filled');
            }
        });
        
        verifyButton.disabled = !isCodeComplete();
        if (!verifyButton.disabled) {
            verifyButton.classList.add('ready');
        }
    });

    function isCodeComplete() {
        return Array.from(inputs).every(input => input.value.length === 1);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            checkRateLimit();
            
            const code = Array.from(inputs).map(input => input.value).join('');
            verifyButton.disabled = true;
            verifyButton.innerHTML = '<span class="spinner"></span>Verifying...';
            
            // Add random delay to prevent timing attacks
            const randomDelay = Math.floor(Math.random() * 1000) + 500;
            await new Promise(resolve => setTimeout(resolve, randomDelay));
            
            // Here you would validate the code with your backend
            if (code === '123456') { // Replace with actual validation
                successMessage.classList.add('show');
                
                // Redirect to new password page after success
                setTimeout(() => {
                    window.location.href = 'new-password.html';
                }, 2000);
            } else {
                throw new Error('Invalid verification code. Please try again.');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.add('shake');
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('filled');
            });
            inputs[0].focus();
            verifyButton.disabled = true;
            verifyButton.classList.remove('ready');
            verifyButton.textContent = 'Verify Code';
            
            setTimeout(() => {
                errorMessage.classList.remove('shake');
            }, 500);
        }
    });

    document.getElementById('resendCode').addEventListener('click', async function(e) {
        e.preventDefault();
        
        try {
            this.disabled = true;
            errorMessage.textContent = '';
            
            // Enable inputs if they were disabled
            inputs.forEach(input => {
                input.disabled = false;
                input.value = '';
                input.classList.remove('filled');
            });
            
            // Add loading state
            this.innerHTML = '<span class="spinner"></span>Sending...';
            
            // Simulate API call with random delay
            const randomDelay = Math.floor(Math.random() * 1000) + 500;
            await new Promise(resolve => setTimeout(resolve, randomDelay));
            
            // Reset timer and update UI
            startTimer();
            this.textContent = 'Resend Code';
            this.disabled = false;
            
            // Show success message
            errorMessage.textContent = 'A new verification code has been sent.';
            errorMessage.style.color = '#4CAF50';
            inputs[0].focus();
            
            setTimeout(() => {
                errorMessage.textContent = '';
                errorMessage.style.color = '';
            }, 3000);
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.color = '';
            this.disabled = false;
            this.textContent = 'Resend Code';
        }
    });
});
