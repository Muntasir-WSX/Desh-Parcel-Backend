export const getDynamicEmailTemplate = (userName: string, title: string, message: string, actionText?: string, actionUrl?: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #070b19; /* Project Dark Theme Background */
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 30px auto;
          background: #0b132b; /* Card Dark Background */
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          border: 1px solid rgba(198, 13, 13, 0.2);
          color: #ffffff;
        }
        .header {
          background: #050814;
          text-align: center;
          padding: 25px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: #c30b0b; /* Brand Red */
          letter-spacing: 1px;
        }
        .body-content {
          padding: 35px 30px;
          color: #cbd5e1; /* Light Slate Text */
          line-height: 1.6;
        }
        .body-content h2 {
          color: #ffffff;
          font-size: 20px;
          margin-top: 0;
        }
        .message-box {
          background: #050814;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          color: #e2e8f0;
          font-size: 14px;
        }
        .btn {
          display: inline-block;
          background: #c30b0b;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 10px;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 20px;
        }
        .footer {
          background: #050814;
          text-align: center;
          padding: 15px;
          font-size: 11px;
          color: #64748b;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>DeshParcel & Logistics</h1>
        </div>
        
        <!-- Body -->
        <div class="body-content">
          <h2>Hello, ${userName || 'Valued User'}!</h2>
          <p style="color: #c30b0b; font-weight: 600; font-size: 14px; margin-bottom: 5px;">${title}</p>
          
          <div class="message-box">
            <p style="margin: 0;">${message}</p>
          </div>
          
          ${actionText && actionUrl ? `<a href="${actionUrl}" class="btn">${actionText}</a>` : ''}
          
          <p style="margin-top: 35px; margin-bottom: 0;">Best regards,</p>
          <p style="margin-top: 5px; font-weight: 600; color: #c30b0b;">The DeshParcel Team</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} DeshParcel Platform. All rights reserved.</p>
          <p>This is an automated notification from your logistics portal.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getOtpEmailTemplate = (userName: string, otpCode: string) =>
  getDynamicEmailTemplate(
    userName,
    'Password Reset OTP',
    `Your password reset code is <strong>${otpCode}</strong>. It expires in 5 minutes.`
  );