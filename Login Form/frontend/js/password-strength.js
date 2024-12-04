// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    // Check length
    if (password.length >= 8) strength++;
    
    // Check for numbers
    if (/\d/.test(password)) strength++;
    
    // Check for lowercase letters
    if (/[a-z]/.test(password)) strength++;
    
    // Check for uppercase letters
    if (/[A-Z]/.test(password)) strength++;
    
    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return {
        score: strength,
        message: getStrengthMessage(strength)
    };
}

function getStrengthMessage(strength) {
    switch(strength) {
        case 0:
        case 1:
            return "Very Weak";
        case 2:
            return "Weak";
        case 3:
            return "Medium";
        case 4:
            return "Strong";
        case 5:
            return "Very Strong";
        default:
            return "";
    }
}

// Export functions for use in main.js
export { checkPasswordStrength };
