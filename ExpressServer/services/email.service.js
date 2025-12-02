import nodemailer from "nodemailer";
import { welcomeTemplate, passwordResetTemplate, orderConfirmationTemplate } from "./email.templates.js";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE === 'true' || true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Generic reusable email sender
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 */
export async function sendEmail({ to, subject, html, text }) {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Send welcome email with auto-generated password
 */
export async function sendWelcomeEmail(email, name, password) {
  return sendEmail({
    to: email,
    subject: "Welcome! Your Account Credentials",
    html: welcomeTemplate(name, email, password),
    text: `
      Welcome to ${process.env.EMAIL_FROM_NAME}!
      
      Hi ${name},
      
      Your account has been successfully created. Below are your login credentials:
      
      Email: ${email}
      Password: ${password}
      
      IMPORTANT: Please change your password after your first login for security purposes.
      
      You can login at: ${process.env.CLIENT_URL}/login
      
      Best regards,
      ${process.env.EMAIL_FROM_NAME} Team
    `,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, name, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: "Password Reset Request",
    html: passwordResetTemplate(name, resetUrl),
    text: `
      Password Reset Request
      
      Hi ${name},
      
      You requested to reset your password. Click the link below:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      ${process.env.EMAIL_FROM_NAME} Team
    `,
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(email, name, orderId, items, total) {
  return sendEmail({
    to: email,
    subject: "Order Confirmation",
    html: orderConfirmationTemplate(name, orderId, items, total),
    text: `
      Order Confirmation
      
      Hi ${name},
      
      Thank you for your order!
      
      Order ID: ${orderId}
      Items: ${items}
      Total: $${total}
      
      We'll notify you when your order ships.
      
      Best regards,
      ${process.env.EMAIL_FROM_NAME} Team
    `,
  });
}

/**
 * Send custom email (for any use case)
 */
export async function sendCustomEmail(to, subject, templateData) {
  return sendEmail({
    to,
    subject,
    html: templateData.html,
    text: templateData.text,
  });
}
