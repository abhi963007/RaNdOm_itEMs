# Marvel Authentication Backend

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- Gmail Account
- Gmail App Password

### Installation
1. Clone the repository
2. Run `npm install`
3. Create a `.env` file with the following variables:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   PORT=3000
   ```

### Running the Server
- Development: `npm run dev`
- Production: `npm start`

### Features
- Email OTP Verification
- Secure Password Reset
- CORS-enabled API
