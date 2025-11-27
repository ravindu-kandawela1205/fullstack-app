import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    console.log('Email config:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD,
      passwordLength: process.env.EMAIL_PASSWORD?.length
    });

    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Send welcome email with auto-generated password
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} password - Auto-generated password
 */
export async function sendWelcomeEmail(email, name, password) {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Welcome! Your Account Credentials",
    html: `
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

      <!-- Logo -->
      <div class="logo">
        <img 
          src="https://res.cloudinary.com/dvjvsbkoy/image/upload/v1764223936/solid-logo_yxnnie.png"
          alt="logo"
          height="40"
          style="height: 40px;"
        >
      </div>

      <!-- Header -->
      <div class="header">
        Welcome to ${process.env.EMAIL_FROM_NAME}!
      </div>

      <!-- Content -->
      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>

        <p>Your account has been successfully created. Below are your login credentials:</p>

        <!-- Credentials -->
        <div class="credentials">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <span class="password">${password}</span></p>
        </div>

        <p class="warning">⚠️ IMPORTANT: Please change your password after your first login for security purposes.</p>

        <p>You can log in here:<br>
          <a href="${process.env.CLIENT_URL}/login">${process.env.CLIENT_URL}/login</a>
        </p>

        <p>If you didn’t create this account, you can safely ignore this email.</p>

        <p>Best regards,<br>
        ${process.env.EMAIL_FROM_NAME} Team</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        This is an automated email. Please do not reply.
      </div>

    </div>
  </body>
</html>


    `,
    text: `
      Welcome to ${process.env.EMAIL_FROM_NAME}!
      
      Hi ${name},
      
      Your account has been successfully created. Below are your login credentials:
      
      Email: ${email}
      Password: ${password}
      
      IMPORTANT: Please change your password after your first login for security purposes.
      
      You can login at: ${process.env.CLIENT_URL}/login
      
      If you didn't create this account, please ignore this email or contact support.
      
      Best regards,
      ${process.env.EMAIL_FROM_NAME} Team
    `,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Send password reset email (optional - for future use)
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} resetToken - Password reset token
 */
export async function sendPasswordResetEmail(email, name, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}