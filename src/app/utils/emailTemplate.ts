export const getOtpEmailTemplate = (userName: string, otpCode: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f6f9; /* Clean Light Background */
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff; /* White Card Background */
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: #ffffff;
          color: #1e293b;
          text-align: center;
          padding: 25px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #2563eb; /* Professional Blue */
        }
        .body-content {
          padding: 35px 30px;
          color: #334155; /* Dark Slate Text for Readability */
          line-height: 1.6;
        }
        .body-content h2 {
          color: #0f172a;
          font-size: 20px;
          margin-top: 0;
        }
        .otp-box {
          background: #f8fafc; /* Light Blue-Gray box inside */
          border: 2px dashed #3b82f6; /* Blue Dashed Border */
          border-radius: 8px;
          text-align: center;
          padding: 20px;
          margin: 25px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          color: #2563eb; /* Royal Blue OTP Code */
          letter-spacing: 6px;
          margin: 0;
        }
        .footer {
          background: #f8fafc;
          text-align: center;
          padding: 15px;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header with White & Blue Theme -->
        <div class="header">
          <h1>DeshParcel & Logistics</h1>
        </div>
        
        <!-- Body -->
        <div class="body-content">
          <h2>Hello, ${userName || 'Valued User'}!</h2>
          <p>We received a request to reset your password for your <strong>DeshParcel</strong> account. Please use the secure verification code below to proceed:</p>
          
          <div class="otp-box">
            <p class="otp-code">${otpCode}</p>
          </div>
          
          <p>This OTP is valid for <strong style="color: #2563eb;">90 seconds</strong>. Please do not share this code with anyone for security reasons.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <p style="margin-top: 35px; margin-bottom: 0;">Best regards,</p>
          <p style="margin-top: 5px; font-weight: 600; color: #2563eb;">The DeshParcel Team</p>
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