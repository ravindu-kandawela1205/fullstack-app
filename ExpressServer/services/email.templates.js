export const welcomeTemplate = (name, email, password) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        line-height: 1.6;
        color: #000000;
        background: #f5f5f5;
        padding: 0;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        padding: 0;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #e5e5e5;
      }
      .logo {
        padding: 20px;
        text-align: left;
      }
      .header {
        background-color: #ffffff;
        color: #22c55e;
        padding: 24px;
        text-align: center;
        border-bottom: 3px solid #22c55e;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        background-color: #ffffff;
        padding: 30px;
        color: #000000;
      }
      .credentials {
        background-color: #f0f0f0;
        padding: 16px;
        border-left: 4px solid #22c55e;
        margin: 20px 0;
        border-radius: 6px;
      }
      .password {
        font-size: 18px;
        font-weight: bold;
        color: #22c55e;
      }
      .warning {
        color: #dc2626;
        font-weight: bold;
        margin-top: 15px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #666;
        font-size: 12px;
      }
      a {
        color: #2563eb;
        text-decoration: none;
      }
      strong {
        color: #000000;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <img 
          src="https://res.cloudinary.com/dvjvsbkoy/image/upload/v1764223936/solid-logo_yxnnie.png"
          alt="logo"
          height="40"
          style="height: 40px;"
        >
      </div>
      <div class="header">
        Welcome to ${process.env.EMAIL_FROM_NAME}!
      </div>
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account has been successfully created. Below are your login credentials:</p>
        <div class="credentials">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <span class="password">${password}</span></p>
        </div>
        <p class="warning">⚠️ IMPORTANT: Please change your password after your first login for security purposes.</p>
        <p>You can log in here:<br>
          <a href="${process.env.CLIENT_URL}/login">${process.env.CLIENT_URL}/login</a>
        </p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <p>Best regards,<br>
        ${process.env.EMAIL_FROM_NAME} Team</p>
      </div>
      <div class="footer">
        This is an automated email. Please do not reply.
      </div>
    </div>
  </body>
</html>
`;

export const passwordResetTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        line-height: 1.6;
        color: #000000;
        background: #f5f5f5;
        padding: 0;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        padding: 0;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #e5e5e5;
      }
      .header {
        background-color: #ffffff;
        color: #dc2626;
        padding: 24px;
        text-align: center;
        border-bottom: 3px solid #dc2626;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        background-color: #ffffff;
        padding: 30px;
        color: #000000;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #dc2626;
        color: #ffffff;
        text-decoration: none;
        border-radius: 6px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #666;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        Password Reset Request
      </div>
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>Or copy this link: <br>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>
        ${process.env.EMAIL_FROM_NAME} Team</p>
      </div>
      <div class="footer">
        This is an automated email. Please do not reply.
      </div>
    </div>
  </body>
</html>
`;

export const orderConfirmationTemplate = (name, orderId, items, total) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        line-height: 1.6;
        color: #000000;
        background: #f5f5f5;
        padding: 0;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        padding: 0;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #e5e5e5;
      }
      .header {
        background-color: #ffffff;
        color: #2563eb;
        padding: 24px;
        text-align: center;
        border-bottom: 3px solid #2563eb;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        background-color: #ffffff;
        padding: 30px;
        color: #000000;
      }
      .order-details {
        background-color: #f0f0f0;
        padding: 16px;
        border-radius: 6px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #666;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        Order Confirmation
      </div>
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for your order! Your order has been confirmed.</p>
        <div class="order-details">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Items:</strong> ${items}</p>
          <p><strong>Total:</strong> $${total}</p>
        </div>
        <p>We'll notify you when your order ships.</p>
        <p>Best regards,<br>
        ${process.env.EMAIL_FROM_NAME} Team</p>
      </div>
      <div class="footer">
        This is an automated email. Please do not reply.
      </div>
    </div>
  </body>
</html>
`;
