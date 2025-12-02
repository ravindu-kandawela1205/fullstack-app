# Nodemailer Implementation Flow - A to Z

## Overview
Complete flow of how Nodemailer sends auto-generated passwords when users register.

---

## Architecture Flow

```
User Registration Request
    ↓
auth.controller.js (register function)
    ↓
Generate Random Password
    ↓
Hash Password & Create User in DB
    ↓
email.templates.js (welcomeTemplate)
    ↓
email.service.js (sendEmail)
    ↓
Nodemailer sends email
    ↓
Response to Frontend
```

---

## 1. Configuration Setup

### Environment Variables (.env)
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Your App Name
```

### Centralized Config (config/application.js)
```javascript
export const application = {
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT),
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
};
```

---

## 2. Email Template (constants/email.templates.js)

Template returns object with `to`, `subject`, `html`:

```javascript
export const welcomeTemplate = (name, email, password) => ({
  to: email,
  subject: "Welcome! Your Account Credentials",
  html: `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome ${name}!</h1>
        <p>Email: ${email}</p>
        <p>Password: ${password}</p>
        <p>⚠️ Change password after first login</p>
      </body>
    </html>
  `
});
```

**Returns:**
```javascript
{
  to: "user@example.com",
  subject: "Welcome! Your Account Credentials",
  html: "<html>...</html>"
}
```

---

## 3. Email Service (services/email.service.js)

Handles Nodemailer transporter and sending:

```javascript
import nodemailer from "nodemailer";
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
```

---

## 4. Auth Controller (controllers/auth.controller.js)

### Complete Register Flow

```javascript
import { generateSecurePassword } from "../utils/passwordGenerator.js";
import { sendEmail } from "../services/email.service.js";
import { welcomeTemplate } from "../constants/email.templates.js";

export async function register(req, res) {
  try {
    // 1. Validate input
    const parsed = registerSchema.parse(req.body);

    // 2. Check if user exists
    const existing = await User.findOne({ email: parsed.email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 3. Generate secure random password
    const generatedPassword = generateSecurePassword(12);
    console.log("Generated password for:", parsed.email);

    // 4. Hash password
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    // 5. Create user in database
    const user = await User.create({
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      role: parsed.role || "user",
    });
    console.log("User created successfully:", user._id);

    // 6. Send welcome email with password
    try {
      // Call template to get email data
      const { to, subject, html } = welcomeTemplate(
        parsed.name, 
        parsed.email, 
        generatedPassword
      );
      
      // Send email
      await sendEmail({ to, subject, html });
      console.log("Welcome email sent to:", parsed.email);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      
      // Rollback: Delete user if email fails
      await User.findByIdAndDelete(user._id);
      
      return res.status(500).json({ 
        message: "Failed to send welcome email. Please try again." 
      });
    }

    // 7. Generate JWT token and set cookie
    const token = signToken({
      sub: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setAuthCookie(res, token);

    // 8. Send response
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ 
        message: "Invalid input", 
        issues: err.issues 
      });
    }
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
```

---

## 5. Step-by-Step Flow Breakdown

### Step 1: User Submits Registration
```javascript
POST /api/auth/register
Body: { name: "John", email: "john@example.com", role: "user" }
```

### Step 2: Generate Password
```javascript
const generatedPassword = generateSecurePassword(12);
// Result: "aB3$xY9#mK2@"
```

### Step 3: Hash Password & Create User
```javascript
const passwordHash = await bcrypt.hash(generatedPassword, 10);
const user = await User.create({ name, email, passwordHash, role });
```

### Step 4: Call Email Template
```javascript
const { to, subject, html } = welcomeTemplate(
  "John",
  "john@example.com",
  "aB3$xY9#mK2@"
);

// Returns:
// {
//   to: "john@example.com",
//   subject: "Welcome! Your Account Credentials",
//   html: "<html>...</html>"
// }
```

### Step 5: Send Email via Nodemailer
```javascript
await sendEmail({ to, subject, html });

// Nodemailer sends email through SMTP
// User receives email with credentials
```

### Step 6: Handle Email Failure (Rollback)
```javascript
catch (emailError) {
  // Delete user from database if email fails
  await User.findByIdAndDelete(user._id);
  
  return res.status(500).json({ 
    message: "Failed to send welcome email" 
  });
}
```

### Step 7: Generate JWT & Set Cookie
```javascript
const token = signToken({ sub: user._id, name, email, role });
setAuthCookie(res, token);
```

### Step 8: Send Response to Frontend
```javascript
res.status(201).json({
  user: { id, name, email, profileImage, role },
  token
});
```

---

## 6. Key Features

### ✅ Auto-Generated Password
- Uses `generateSecurePassword(12)` utility
- Creates random 12-character password with special chars

### ✅ Email Template Returns Complete Config
- Template returns `{ to, subject, html }`
- Controller destructures and passes to sendEmail
- Clean separation of concerns

### ✅ Rollback on Email Failure
- If email fails, user is deleted from database
- Prevents accounts without credentials
- User must retry registration

### ✅ Security
- Password hashed with bcrypt (10 rounds)
- JWT token stored in HTTP-only cookie
- Credentials sent only via email

### ✅ Reusable Architecture
- `sendEmail()` accepts any `{ to, subject, html }`
- Easy to add more templates (password reset, order confirmation)
- Centralized email configuration

---

## 7. Adding More Email Templates

### Password Reset Template
```javascript
export const passwordResetTemplate = (name, resetUrl) => ({
  to: email,
  subject: "Password Reset Request",
  html: `
    <html>
      <body>
        <h1>Hi ${name}</h1>
        <p>Click to reset: <a href="${resetUrl}">Reset Password</a></p>
      </body>
    </html>
  `
});
```

### Usage in Controller
```javascript
const { to, subject, html } = passwordResetTemplate(name, resetUrl);
await sendEmail({ to, subject, html });
```

---

## 8. Testing

### Test Email Sending
```javascript
// In controller or test file
const { to, subject, html } = welcomeTemplate(
  "Test User",
  "test@example.com",
  "TestPass123!"
);

await sendEmail({ to, subject, html });
console.log("Test email sent!");
```

### Check Email Logs
```
Email sent to test@example.com: <message-id>
```

---

## 9. Common Issues & Solutions

### Issue: Email not sending
**Solution:** Check Gmail App Password, enable 2FA, verify EMAIL_USER and EMAIL_PASSWORD

### Issue: User created but email failed
**Solution:** Rollback implemented - user is deleted automatically

### Issue: Template not found
**Solution:** Ensure template is exported and imported correctly

### Issue: HTML not rendering
**Solution:** Check email client supports HTML, verify template syntax

---

## 10. Email Providers

### Gmail
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Outlook
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

---

## Summary

1. **User registers** → Controller receives request
2. **Generate password** → Random secure password created
3. **Create user** → User saved in database with hashed password
4. **Call template** → `welcomeTemplate()` returns `{ to, subject, html }`
5. **Destructure** → Controller gets `to`, `subject`, `html`
6. **Send email** → `sendEmail()` uses Nodemailer to send
7. **Handle failure** → Delete user if email fails
8. **Set cookie** → JWT token saved in browser
9. **Response** → User data sent to frontend

**Result:** User receives email with auto-generated password and can login immediately.
