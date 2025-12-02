import nodemailer from "nodemailer";
import { welcomeTemplate } from "../constants/email.templates.js";
import { application } from "../config/application.js";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: application.EMAIL_HOST,
      port: application.EMAIL_PORT,
      secure: application.EMAIL_SECURE,
      auth: {
        user: application.EMAIL_USER,
        pass: application.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: `"${application.EMAIL_FROM_NAME}" <${application.EMAIL_FROM}>`,
    to,
    subject,
    html,
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
 * Send password reset email
 */
// export async function sendPasswordResetEmail(email, name, resetToken) {
//   const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
//   return sendEmail({
//     to: email,
//     subject: "Password Reset Request",
//     html: passwordResetTemplate(name, resetUrl),
//     text: `
//       Password Reset Request
      
//       Hi ${name},
      
//       You requested to reset your password. Click the link below:
//       ${resetUrl}
      
//       This link will expire in 1 hour.
      
//       If you didn't request this, please ignore this email.
      
//       Best regards,
//       ${process.env.EMAIL_FROM_NAME} Team
//     `,
//   });
// }

// /**
//  * Send order confirmation email
//  */
// export async function sendOrderConfirmationEmail(email, name, orderId, items, total) {
//   return sendEmail({
//     to: email,
//     subject: "Order Confirmation",
//     html: orderConfirmationTemplate(name, orderId, items, total),
//     text: `
//       Order Confirmation
      
//       Hi ${name},
      
//       Thank you for your order!
      
//       Order ID: ${orderId}
//       Items: ${items}
//       Total: $${total}
      
//       We'll notify you when your order ships.
      
//       Best regards,
//       ${process.env.EMAIL_FROM_NAME} Team
//     `,
//   });
// }

// /**
//  * Send custom email (for any use case)
//  */
// export async function sendCustomEmail(to, subject, templateData) {
//   return sendEmail({
//     to,
//     subject,
//     html: templateData.html,
//     text: templateData.text,
//   });
// }
