// Email Verification Service
class EmailVerificationService {
    constructor() {
        // In-memory storage for users and OTPs
        this.users = new Map();
        this.otps = new Map();
    }

    // Generate a random 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Validate email format
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Validate password strength
    validatePassword(password) {
        const minLength = 12;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return password.length >= minLength && 
               hasUpperCase && 
               hasLowerCase && 
               hasNumbers && 
               hasSpecialChar;
    }

    // Simulate sending email (in a real app, this would use a real email service)
    async sendVerificationEmail(email, otp) {
        console.log(`Sending verification email to ${email}`);
        console.log(`Your OTP is: ${otp}`);
        
        // In a real implementation, you'd use a service like Nodemailer
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 1000);
        });
    }

    // Register a new user
    async registerUser(email, password) {
        // Validate inputs
        if (!this.validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (!this.validatePassword(password)) {
            throw new Error('Password does not meet requirements');
        }

        // Check if user already exists
        if (this.users.has(email)) {
            throw new Error('User already exists');
        }

        // Generate OTP
        const otp = this.generateOTP();

        // Store user details and OTP
        this.users.set(email, {
            email,
            password, // In a real app, this would be hashed
            verified: false
        });
        this.otps.set(email, {
            otp,
            createdAt: Date.now()
        });

        // Send verification email
        await this.sendVerificationEmail(email, otp);

        return {
            message: 'Registration successful. Please check your email for verification.',
            email
        };
    }

    // Verify OTP
    async verifyOTP(email, userOTP) {
        const storedOTP = this.otps.get(email);
        
        if (!storedOTP) {
            throw new Error('No OTP found. Please request a new one.');
        }

        // Check OTP expiration (5 minutes)
        const currentTime = Date.now();
        if (currentTime - storedOTP.createdAt > 5 * 60 * 1000) {
            this.otps.delete(email);
            throw new Error('OTP has expired. Please request a new one.');
        }

        if (storedOTP.otp !== userOTP) {
            throw new Error('Invalid OTP');
        }

        // Mark user as verified
        const user = this.users.get(email);
        if (user) {
            user.verified = true;
        }

        // Clear OTP
        this.otps.delete(email);

        return {
            message: 'Email verified successfully',
            email
        };
    }

    // Resend OTP
    async resendOTP(email) {
        if (!this.users.has(email)) {
            throw new Error('User not found');
        }

        // Generate new OTP
        const newOTP = this.generateOTP();

        // Update OTP
        this.otps.set(email, {
            otp: newOTP,
            createdAt: Date.now()
        });

        // Send new verification email
        await this.sendVerificationEmail(email, newOTP);

        return {
            message: 'New OTP sent to your email',
            email
        };
    }

    // Password reset
    async initiatePasswordReset(email) {
        if (!this.users.has(email)) {
            throw new Error('User not found');
        }

        // Generate reset OTP
        const resetOTP = this.generateOTP();

        // Store reset OTP
        this.otps.set(email, {
            otp: resetOTP,
            createdAt: Date.now(),
            type: 'reset'
        });

        // Send reset email
        await this.sendVerificationEmail(email, resetOTP);

        return {
            message: 'Password reset OTP sent to your email',
            email
        };
    }

    // Confirm password reset
    async confirmPasswordReset(email, newPassword, otp) {
        const storedOTP = this.otps.get(email);
        
        if (!storedOTP || storedOTP.type !== 'reset') {
            throw new Error('Invalid reset request');
        }

        // Validate new password
        if (!this.validatePassword(newPassword)) {
            throw new Error('New password does not meet requirements');
        }

        // Verify OTP (similar to verifyOTP method)
        const currentTime = Date.now();
        if (currentTime - storedOTP.createdAt > 5 * 60 * 1000) {
            this.otps.delete(email);
            throw new Error('Reset OTP has expired');
        }

        if (storedOTP.otp !== otp) {
            throw new Error('Invalid reset OTP');
        }

        // Update user password
        const user = this.users.get(email);
        if (user) {
            user.password = newPassword; // In real app, hash the password
        }

        // Clear OTP
        this.otps.delete(email);

        return {
            message: 'Password reset successful',
            email
        };
    }
}

// Export a singleton instance
const emailVerificationService = new EmailVerificationService();
export default emailVerificationService;
