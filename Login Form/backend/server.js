const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory user storage (replace with database in production)
const userStorage = new Map();

// In-memory OTP storage
const otpStorage = new Map();

// Nodemailer transporter using a generic SMTP service
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength validation
function validatePassword(password) {
    // Comprehensive password strength check
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

// User Registration Route
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!validateEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email address' 
        });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password does not meet requirements' 
        });
    }

    // Check if user already exists
    if (userStorage.has(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'User already exists' 
        });
    }

    // Store user (in a real app, hash the password)
    userStorage.set(email, { 
        password, 
        registeredAt: Date.now() 
    });

    res.status(201).json({ 
        success: true, 
        message: 'User registered successfully' 
    });
});

// Send OTP for Password Reset
app.post('/send-reset-otp', (req, res) => {
    const { email } = req.body;

    // Validate email
    if (!validateEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email address' 
        });
    }

    // Check if user exists
    if (!userStorage.has(email)) {
        return res.status(404).json({ 
            success: false, 
            message: 'No account found with this email' 
        });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration
    otpStorage.set(email, {
        code: otp,
        createdAt: Date.now()
    });

    // Prepare email
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Marvel Authentication - Password Reset',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>🦸‍♂️ Marvel Authentication</h2>
                <p>You have requested to reset your password. Use the following OTP to proceed:</p>
                <h1 style="color: #ED1D24; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in 15 minutes.</p>
                <small>If you didn't request this, please ignore this email.</small>
            </div>
        `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email sending error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send verification code' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Verification code sent successfully' 
        });
    });
});

// Verify OTP and Reset Password
app.post('/reset-password', (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Validate inputs
    if (!validateEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email address' 
        });
    }

    // Check if OTP exists
    const storedOTP = otpStorage.get(email);
    if (!storedOTP) {
        return res.status(400).json({ 
            success: false, 
            message: 'No OTP found. Please request a new one.' 
        });
    }

    // Check OTP expiry (15 minutes)
    const currentTime = Date.now();
    if (currentTime - storedOTP.createdAt > 15 * 60 * 1000) {
        otpStorage.delete(email);
        return res.status(400).json({ 
            success: false, 
            message: 'OTP has expired' 
        });
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid OTP' 
        });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        return res.status(400).json({ 
            success: false, 
            message: 'New password does not meet requirements' 
        });
    }

    // Update user password (in a real app, hash the password)
    const user = userStorage.get(email);
    user.password = newPassword;

    // Clear OTP after successful reset
    otpStorage.delete(email);

    res.status(200).json({ 
        success: true, 
        message: 'Password reset successfully' 
    });
});

// Send OTP Email Route
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    try {
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with expiration
        otpStorage.set(email, {
            code: otp,
            createdAt: Date.now()
        });

        // Email configuration
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Marvel Authentication - Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>🦸‍♂️ Marvel Authentication</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color: #ED1D24; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 15 minutes.</p>
                    <small>If you didn't request this, please ignore this email.</small>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            success: true, 
            message: 'Verification code sent successfully' 
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send verification code' 
        });
    }
});

// Verify OTP Route
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    const storedOTP = otpStorage.get(email);

    if (!storedOTP) {
        return res.status(400).json({ 
            success: false, 
            message: 'No OTP found for this email' 
        });
    }

    // Check OTP expiry (15 minutes)
    const currentTime = Date.now();
    if (currentTime - storedOTP.createdAt > 15 * 60 * 1000) {
        otpStorage.delete(email);
        return res.status(400).json({ 
            success: false, 
            message: 'OTP has expired' 
        });
    }

    if (storedOTP.code !== otp) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid OTP' 
        });
    }

    // Clear OTP after successful verification
    otpStorage.delete(email);

    res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully' 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    process.exit(0);
});
