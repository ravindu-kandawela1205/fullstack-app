# Inquiry Form with EmailJS - Implementation Guide

## Overview
Add an "Inquiry" page where users can submit contact forms (name, email, phone, subject, message) that send emails using EmailJS.

---

## What You'll Build

### Features
- Inquiry form with validation
- Send emails via EmailJS (no backend needed)
- Form submission feedback
- Sidebar navigation item
- Professional form design

### Tech Stack
- **Frontend**: React + TypeScript
- **Email Service**: EmailJS (free tier: 200 emails/month)
- **Form Validation**: React Hook Form + Zod
- **UI**: Shadcn/ui components (already in project)

---

## Step 1: EmailJS Setup

### 1.1 Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Click "Sign Up" (free account)
3. Verify your email

### 1.2 Add Email Service
1. Go to **Email Services** tab
2. Click "Add New Service"
3. Choose provider (Gmail recommended):
   - **Gmail**: Connect your Gmail account
   - **Outlook**: Connect Outlook
   - **Custom SMTP**: Use any email server
4. Click "Connect Account" and authorize
5. Copy **Service ID** (e.g., `service_abc123`)

### 1.3 Create Email Templates (2 Templates)

**Template 1: Admin Notification**
1. Go to **Email Templates** tab
2. Click "Create New Template"
3. **Template Name**: `inquiry_to_admin`
4. **To Email**: `your-email@gmail.com` (YOUR email)
5. **Template Content**:
```
Subject: New Inquiry from {{from_name}}

From: {{from_name}}
Email: {{from_email}}
Phone: {{from_phone}}
Subject: {{subject}}

Message:
{{message}}

---
Sent from Inquiry Form
```
6. Click "Save"
7. Copy **Template ID** (e.g., `template_admin123`)

**Template 2: User Auto-Reply**
1. Click "Create New Template" again
2. **Template Name**: `inquiry_auto_reply`
3. **To Email**: `{{from_email}}`
4. **Template Content**:
```
Subject: Thank you for your inquiry

Hi {{from_name}},

Thank you for contacting us! We have received your inquiry and will get back to you soon.

Best regards,
Your Team
```
5. Click "Save"
6. Copy **Template ID** (e.g., `template_user456`)

### 1.4 Get Public Key
1. Go to **Account** → **General**
2. Find **Public Key** (e.g., `abcdefghijklmnop`)
3. Copy it

### 1.5 Configure Recipient Email
In the template settings, set **To Email** to your email address where you want to receive inquiries.

---

## Step 2: Install EmailJS

### 2.1 Install Package
```bash
cd ReactApp
npm install @emailjs/browser
```

### 2.2 Add Environment Variables
**File:** `ReactApp/.env`

```env
VITE_API_URL=http://localhost:8000

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_ADMIN_TEMPLATE_ID=template_admin123
VITE_EMAILJS_TEMPLATE_ID=template_user456
VITE_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
```

**Replace with your IDs:**
- `SERVICE_ID`: From Email Services
- `ADMIN_TEMPLATE_ID`: Template 1 (to you)
- `TEMPLATE_ID`: Template 2 (to user)
- `PUBLIC_KEY`: From Account

---

## Step 3: File Changes Summary

### Files to CREATE:
```
ReactApp/src/pages/Inquiry.tsx
```

### Files to UPDATE:
```
ReactApp/.env
ReactApp/src/constants/routes.constant.ts
ReactApp/src/components/layout/Sidebar.tsx
ReactApp/src/App.tsx
```

---

## Step 4: Add Route Constant

**File:** `ReactApp/src/constants/routes.constant.ts`

**Find:**
```typescript
export const ROUTES = {
  DASHBOARD: '/',
  product_list: '/product',
  LOCAL_USERS: '/local-users',
  FIRST_TABLE: '/first-table',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;
```

**Change to:**
```typescript
export const ROUTES = {
  DASHBOARD: '/',
  product_list: '/product',
  LOCAL_USERS: '/local-users',
  INQUIRY: '/inquiry', // ADD THIS LINE
  FIRST_TABLE: '/first-table',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;
```

---

## Step 5: Create Inquiry Page

**File:** `ReactApp/src/pages/Inquiry.tsx` (NEW FILE - CREATE THIS)

```typescript
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Phone, User, MessageSquare } from "lucide-react";

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryForm = z.infer<typeof inquirySchema>;

export default function Inquiry() {
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (data: InquiryForm) => {
    setSending(true);
    try {
      // Send to admin
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID,
        {
          from_name: data.name,
          from_email: data.email,
          from_phone: data.phone,
          subject: data.subject,
          message: data.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      // Send auto-reply to user
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: data.name,
          from_email: data.email,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success("Inquiry sent successfully!");
      reset();
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contact Inquiry</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Subject
              </Label>
              <Input
                id="subject"
                placeholder="What is this regarding?"
                {...register("subject")}
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your inquiry..."
                rows={6}
                {...register("message")}
                className={errors.message ? "border-red-500" : ""}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending..." : "Send Inquiry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Step 6: Update Sidebar

**File:** `ReactApp/src/components/layout/Sidebar.tsx`

**Find this import:**
```typescript
import { LayoutDashboard, Users, UserCog, ChevronRight } from "lucide-react";
```

**Change to:**
```typescript
import { LayoutDashboard, Users, UserCog, Mail, ChevronRight } from "lucide-react";
```

**Find this array:**
```typescript
const menuItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.product_list, label: "Products", icon: Users },
  { path: ROUTES.LOCAL_USERS, label: "Local Users", icon: UserCog, adminOnly: false },
];
```

**Change to:**
```typescript
const menuItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.product_list, label: "Products", icon: Users },
  { path: ROUTES.LOCAL_USERS, label: "Local Users", icon: UserCog, adminOnly: false },
  { path: ROUTES.INQUIRY, label: "Inquiry", icon: Mail, adminOnly: false },
];
```

---

## Step 7: Update App Routes

**File:** `ReactApp/src/App.tsx`

**Find imports:**
```typescript
import Dashboard from '@/pages/Dashboard';
import ProductsTable from '@/pages/ProductsTable';
import LocalUsersTable from '@/pages/LocalUsersTable';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
```

**Add this import:**
```typescript
import Inquiry from '@/pages/Inquiry';
```

**Find routes:**
```typescript
<Routes>
  <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
  <Route path={ROUTES.product_list} element={<ProductsTable />} />
  <Route path={ROUTES.LOCAL_USERS} element={<LocalUsersTable />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

**Add inquiry route:**
```typescript
<Routes>
  <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
  <Route path={ROUTES.product_list} element={<ProductsTable />} />
  <Route path={ROUTES.LOCAL_USERS} element={<LocalUsersTable />} />
  <Route path={ROUTES.INQUIRY} element={<Inquiry />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## How It Works

### Flow
```
User fills form → Validates → Submits → EmailJS sends email → Success toast → Form resets
```

### EmailJS Process
1. User submits form
2. `emailjs.send()` called with template data
3. EmailJS API sends email to your configured address
4. No backend server needed
5. Email arrives in your inbox

---

## Testing

1. **Install package:**
```bash
cd ReactApp
npm install @emailjs/browser
```

2. **Add EmailJS credentials to `.env`**

3. **Create `Inquiry.tsx` page**

4. **Update 3 files:**
   - `routes.constant.ts`
   - `Sidebar.tsx`
   - `App.tsx`

5. **Test:**
   - Navigate to `/inquiry`
   - Fill form
   - Submit
   - Check your email

---

## File Paths Summary

```
CREATE:
└── ReactApp/src/pages/Inquiry.tsx

UPDATE:
├── ReactApp/.env (add EmailJS vars)
├── ReactApp/src/constants/routes.constant.ts (add INQUIRY route)
├── ReactApp/src/components/layout/Sidebar.tsx (add menu item)
└── ReactApp/src/App.tsx (add route)
```

---

## Troubleshooting

**"Failed to send inquiry"**
- Check EmailJS credentials in `.env`
- Restart dev server after changing `.env`
- Verify Service ID, Template ID, Public Key

**Email not received**
- Check spam folder
- Verify "To Email" in EmailJS template
- Test with different email address

**Sidebar item not showing**
- Check `ROUTES.INQUIRY` exists
- Verify `Mail` icon imported
- Restart dev server

---

## Summary

**What to do:**
1. Create EmailJS account and get credentials
2. Install `@emailjs/browser`
3. Create `Inquiry.tsx` page
4. Update 4 files (routes, sidebar, app, env)
5. Test form submission

**Result:**
- Professional inquiry form
- Email sending without backend
- Sidebar navigation
- Form validation
- Success/error feedback
