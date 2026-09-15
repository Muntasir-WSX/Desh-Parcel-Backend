export const getOtpEmailTemplate = (userName: string, otpCode: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #09090b; /* Deep Dark Background */
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 30px auto;
          background: #121212; /* Rich Black Card Background */
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(220, 38, 38, 0.15);
          border: 1px solid #27272a;
        }
        .header {
          background: linear-gradient(135deg, #dc2626, #991b1b); /* Premium Red Gradient */
          color: #ffffff;
          text-align: center;
          padding: 25px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #ffffff;
        }
        .body-content {
          padding: 35px 30px;
          color: #e4e4e7; /* Light Gray Text for Readability on Dark */
          line-height: 1.6;
        }
        .body-content h2 {
          color: #ffffff;
          font-size: 20px;
          margin-top: 0;
        }
        .otp-box {
          background: #18181b; /* Darker box inside */
          border: 2px dashed #dc2626; /* Red Dashed Border */
          border-radius: 8px;
          text-align: center;
          padding: 20px;
          margin: 25px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          color: #ef4444; /* Bright Red OTP Code */
          letter-spacing: 6px;
          margin: 0;
        }
        .footer {
          background: #09090b;
          text-align: center;
          padding: 15px;
          font-size: 12px;
          color: #71717a;
          border-top: 1px solid #27272a;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header with Red & Black Branding -->
        <div class="header">
          <h1>📦 DeshParcel & Logistics</h1>
        </div>
        
        <!-- Body -->
        <div class="body-content">
          <h2>Hello, ${userName || 'Valued User'}!</h2>
          <p>We received a request to reset your password for your <strong>DeshParcel</strong> account. Please use the secure verification code below to proceed:</p>
          
          <div class="otp-box">
            <p class="otp-code">${otpCode}</p>
          </div>
          
          <p>This OTP is valid for <strong style="color: #ef4444;">10 minutes</strong>. Please do not share this code with anyone for security reasons.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <p style="margin-top: 35px; margin-bottom: 0;">Best regards,</p>
          <p style="margin-top: 5px; font-weight: 600; color: #ef4444;">The DeshParcel Team</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} DeshParcel Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};