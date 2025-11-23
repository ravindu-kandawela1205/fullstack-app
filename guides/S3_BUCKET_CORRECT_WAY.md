# AWS S3 Image Upload - Complete Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [AWS Setup](#aws-setup)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [How It Works](#how-it-works)
6. [Reuse in Other Projects](#reuse-in-other-projects)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Does
- Users upload images directly to AWS S3
- Backend generates presigned URLs (secure temporary upload links)
- Image URLs stored in MongoDB
- No images stored on your server

### Architecture Flow
```
User selects image → Frontend requests presigned URL → Backend generates URL →
Frontend uploads to S3 → S3 returns URL → Save URL to database
```

### Why Presigned URLs?
- **Security**: Users can't access your AWS credentials
- **Direct Upload**: Files go straight to S3, not through your server
- **Temporary**: URLs expire in 5 minutes
- **Scalable**: Your server doesn't handle file uploads

---

## AWS Setup

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Complete signup (requires credit card, but S3 has free tier)

### Step 2: Create S3 Bucket
1. Login to AWS Console: https://console.aws.amazon.com/
2. Search "S3" in top search bar
3. Click "Create bucket"
4. **Bucket name**: `your-app-images` (must be globally unique)
5. **Region**: `us-east-1` (or your preferred region)
6. **Block Public Access**: UNCHECK all boxes (we need public read)
7. Click "Create bucket"

### Step 3: Configure Bucket CORS
**Why?** Allows browser to upload directly to S3 from your frontend.

1. Click on your bucket name
2. Go to **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit**
5. Paste:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```
6. Click **Save changes**

**Explanation:**
- `AllowedHeaders`: Accept any headers from browser
- `AllowedMethods`: Allow PUT (upload), GET (view), POST
- `AllowedOrigins`: Accept requests from any domain (use specific domain in production)
- `ExposeHeaders`: Allow browser to read ETag (upload confirmation)

### Step 4: Configure Bucket Policy (Public Read)
**Why?** Allows anyone to view uploaded images (but not upload/delete).

1. Still in **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**
4. Paste (replace `your-app-images`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-app-images/*"
    }
  ]
}
```
5. Click **Save changes**

**Explanation:**
- `Principal: "*"`: Anyone can access
- `Action: "s3:GetObject"`: Only read/view permission
- `Resource`: Applies to all files in bucket

### Step 5: Create IAM User
**Why?** Separate credentials for your app (not root account).

1. Search "IAM" in AWS Console
2. Click **Users** in left sidebar
3. Click **Create user**
4. **User name**: `s3-upload-app`
5. Click **Next**
6. Select **Attach policies directly**
7. Search and check: `AmazonS3FullAccess`
8. Click **Next** → **Create user**

### Step 6: Create Access Keys
**Why?** Credentials for your backend to access S3.

1. Click on the user you just created
2. Go to **Security credentials** tab
3. Scroll to **Access keys**
4. Click **Create access key**
5. Select **Application running outside AWS**
6. Click **Next** → **Create access key**
7. **COPY BOTH KEYS NOW** (secret shown only once):
   - Access key ID: `AKIAIOSFODNN7EXAMPLE`
   - Secret access key: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
8. Click **Done**

---

## Backend Implementation

### File Structure
```
ExpressServer/
├── config/
│   └── s3.js (NOT USED - see explanation below)
├── controllers/
│   └── upload.controller.js
├── route/
│   └── upload.routes.js
├── .env
└── index.js
```

### Step 1: Install Dependencies
```bash
cd ExpressServer
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Packages:**
- `@aws-sdk/client-s3`: AWS S3 client
- `@aws-sdk/s3-request-presigner`: Generate presigned URLs

### Step 2: Environment Variables
**File:** `ExpressServer/.env`

```env
PORT=8000
MONGO_URL=mongodb://localhost:27017/dbconnect

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=your-app-images
```

**Explanation:**
- `AWS_REGION`: Where your bucket is located
- `AWS_ACCESS_KEY_ID`: From Step 6 above
- `AWS_SECRET_ACCESS_KEY`: From Step 6 above
- `AWS_S3_BUCKET`: Your bucket name from Step 2

### Step 3: Upload Controller
**File:** `ExpressServer/controllers/upload.controller.js`

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

export const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    
    const bucket = process.env.AWS_S3_BUCKET;
    
    if (!bucket) {
      return res.status(500).json({ error: "S3 bucket not configured" });
    }
    
    // Create S3 client HERE (not at startup)
    // This ensures env variables are loaded
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    // Generate unique file name
    const key = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${fileName}`;
    
    // Create upload command
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });
    
    // Generate presigned URL (expires in 5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    
    // Return both upload URL and final file URL
    res.json({
      uploadUrl: uploadUrl,
      fileUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};
```

**Explanation:**

1. **S3Client Creation**: Created inside function (not at module level)
   - **Why?** Ensures `process.env` is loaded by dotenv first
   - **Common mistake**: Creating at top level causes "invalid credentials" error

2. **Unique File Name**: `timestamp-random-originalname`
   - Prevents file name collisions
   - Keeps original name for reference

3. **PutObjectCommand**: Defines what operation to allow
   - `Bucket`: Where to upload
   - `Key`: File path/name in bucket
   - `ContentType`: MIME type (image/jpeg, image/png, etc.)

4. **getSignedUrl**: Generates temporary upload URL
   - `expiresIn: 300`: Valid for 5 minutes
   - Returns URL with AWS signature

5. **Response**: Two URLs
   - `uploadUrl`: Temporary URL for uploading (with signature)
   - `fileUrl`: Permanent URL to access file after upload

### Step 4: Upload Routes
**File:** `ExpressServer/route/upload.routes.js`

```javascript
import { Router } from "express";
import { getPresignedUrl } from "../controllers/upload.controller.js";

const router = Router();

router.post("/presigned-url", getPresignedUrl);

export default router;
```

**Explanation:**
- Single endpoint: `POST /api/upload/presigned-url`
- Accepts: `{ fileName, fileType }`
- Returns: `{ uploadUrl, fileUrl }`

### Step 5: Register Routes
**File:** `ExpressServer/index.js`

```javascript
import uploadRoutes from "./route/upload.routes.js";

// ... other imports

app.use("/api/upload", uploadRoutes);
```

**Explanation:**
- Mounts upload routes at `/api/upload`
- Full endpoint: `http://localhost:8000/api/upload/presigned-url`

---

## Frontend Implementation

### File Structure
```
ReactApp/
└── src/
    └── components/
        └── S3Upload.tsx
```

### S3Upload Component
**File:** `ReactApp/src/components/S3Upload.tsx`

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Link } from "lucide-react";
import { toast } from "sonner";

interface S3UploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function S3Upload({ value, onChange, label = "Image" }: S3UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Step 1: Request presigned URL from backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName: file.name, 
          fileType: file.type 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, fileUrl } = await res.json();

      // Step 2: Upload file directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload to S3");
      }

      // Step 3: Save file URL to form state
      onChange(fileUrl);
      toast.success("Image uploaded!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // Clear input
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      try {
        new URL(urlInput.trim());
        onChange(urlInput.trim());
        setUrlInput("");
        setShowUrlInput(false);
        toast.success("Image URL added!");
      } catch {
        toast.error("Invalid URL");
      }
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
            onClick={() => onChange("")}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" disabled={uploading} asChild>
              <label>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowUrlInput(!showUrlInput)}>
              <Link className="w-4 h-4" />
            </Button>
          </div>
          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button type="button" onClick={handleUrlSubmit}>Add</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Explanation:**

1. **Props:**
   - `value`: Current image URL
   - `onChange`: Callback when URL changes
   - `label`: Field label

2. **File Upload Flow:**
   - User selects file
   - Validate size (5MB limit)
   - Request presigned URL from backend
   - Upload file to S3 using presigned URL
   - Call `onChange` with final file URL

3. **Manual URL Input:**
   - Alternative to uploading
   - User can paste existing image URL
   - Validates URL format

4. **Preview:**
   - Shows uploaded image
   - Remove button to clear

### Usage in Forms
```typescript
import S3Upload from "@/components/S3Upload";

function UserForm() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <form>
      <S3Upload
        value={imageUrl}
        onChange={setImageUrl}
        label="User Image"
      />
      {/* Other form fields */}
    </form>
  );
}
```

---

## How It Works

### Complete Upload Flow

```
1. User clicks "Upload Image"
   ↓
2. Frontend: handleFileUpload() triggered
   ↓
3. Frontend → Backend: POST /api/upload/presigned-url
   Body: { fileName: "photo.jpg", fileType: "image/jpeg" }
   ↓
4. Backend: Creates S3Client with credentials
   ↓
5. Backend: Generates unique key: "1234567890-abc123-photo.jpg"
   ↓
6. Backend: Creates PutObjectCommand
   ↓
7. Backend: Calls getSignedUrl() → AWS SDK
   ↓
8. AWS SDK: Generates presigned URL with signature
   ↓
9. Backend → Frontend: Returns
   {
     uploadUrl: "https://bucket.s3.region.amazonaws.com/key?signature...",
     fileUrl: "https://bucket.s3.region.amazonaws.com/key"
   }
   ↓
10. Frontend: PUT request to uploadUrl with file
    ↓
11. S3: Validates signature, accepts upload
    ↓
12. Frontend: Calls onChange(fileUrl)
    ↓
13. Form: Saves fileUrl to state
    ↓
14. Form Submit: Sends fileUrl to backend
    ↓
15. Backend: Saves fileUrl to MongoDB
```

### Security Model

**What's Secure:**
- AWS credentials never exposed to frontend
- Presigned URLs expire in 5 minutes
- Users can only upload (not delete/list)
- Each upload gets unique URL

**What's Public:**
- Uploaded images are publicly readable
- Anyone with URL can view image
- Bucket contents not listable

---

## Reuse in Other Projects

### Quick Setup Checklist

**AWS (One-time):**
- [ ] Create S3 bucket
- [ ] Configure CORS
- [ ] Add bucket policy (public read)
- [ ] Create IAM user
- [ ] Generate access keys

**Backend:**
1. Install packages:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

2. Copy files:
   - `controllers/upload.controller.js`
   - `route/upload.routes.js`

3. Add to `.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
```

4. Register routes in `index.js`:
```javascript
import uploadRoutes from "./route/upload.routes.js";
app.use("/api/upload", uploadRoutes);
```

**Frontend:**
1. Copy `components/S3Upload.tsx`

2. Use in forms:
```typescript
import S3Upload from "@/components/S3Upload";

<S3Upload
  value={imageUrl}
  onChange={setImageUrl}
  label="Image"
/>
```

3. Save URL to database:
```typescript
const formData = {
  name: "...",
  imageUrl: imageUrl, // S3 URL
};
await api.post("/users", formData);
```

### Customization Options

**Change Upload Folder:**
```javascript
// In upload.controller.js
const key = `users/${Date.now()}-${fileName}`; // uploads/users/...
```

**Change Expiration Time:**
```javascript
const url = await getSignedUrl(s3Client, command, { 
  expiresIn: 600 // 10 minutes
});
```

**Add File Type Validation:**
```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(fileType)) {
  return res.status(400).json({ error: "Invalid file type" });
}
```

**Add Authentication:**
```javascript
import { verifyToken } from "../middleware/auth.js";

router.post("/presigned-url", verifyToken, getPresignedUrl);
```

---

## Troubleshooting

### "Resolved credential object is not valid"

**Cause:** S3Client created before env variables loaded

**Fix:** Create S3Client inside function, not at module level
```javascript
// ❌ Wrong
const s3Client = new S3Client({ ... }); // At top of file

export const getPresignedUrl = async (req, res) => {
  // Use s3Client
};

// ✅ Correct
export const getPresignedUrl = async (req, res) => {
  const s3Client = new S3Client({ ... }); // Inside function
};
```

### "Failed to fetch" / CORS Error

**Cause:** S3 bucket CORS not configured

**Fix:** Add CORS policy to bucket (see Step 3 in AWS Setup)

### Image URL works but can't view image

**Cause:** Bucket not publicly readable

**Fix:** Add bucket policy (see Step 4 in AWS Setup)

### "Access Denied" when uploading

**Cause:** IAM user lacks permissions

**Fix:** Attach `AmazonS3FullAccess` policy to IAM user

### Presigned URL expires immediately

**Cause:** Server time incorrect

**Fix:** Sync server time or increase expiration:
```javascript
const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });
```

### Image not showing in form after upload

**Cause:** `onChange` not called or URL incorrect

**Fix:** Check browser console, verify `fileUrl` format:
```
https://bucket-name.s3.region.amazonaws.com/file-key
```

---

## Best Practices

### Security
- Never commit `.env` to git
- Use IAM user (not root credentials)
- Rotate access keys regularly
- Use specific CORS origins in production
- Add authentication to presigned URL endpoint

### Performance
- Set appropriate expiration times
- Use CloudFront CDN for faster delivery
- Compress images before upload
- Use lazy loading for images

### Cost Optimization
- Delete unused files regularly
- Use S3 lifecycle policies
- Monitor usage in AWS Cost Explorer
- Use S3 Intelligent-Tiering for old files

### Production Checklist
- [ ] Use environment-specific buckets (dev/staging/prod)
- [ ] Enable S3 versioning
- [ ] Set up CloudWatch alarms
- [ ] Configure bucket logging
- [ ] Add rate limiting to upload endpoint
- [ ] Implement file size limits
- [ ] Add virus scanning (AWS Macie)
- [ ] Use CloudFront for CDN

---

## Summary

**What You Built:**
- Secure image upload to AWS S3
- Presigned URL generation
- Direct browser-to-S3 upload
- Reusable upload component

**Key Files:**
- Backend: `upload.controller.js`, `upload.routes.js`
- Frontend: `S3Upload.tsx`
- Config: `.env`

**Key Concept:**
Create S3Client inside function (not at module level) to ensure environment variables are loaded.

**Next Steps:**
- Add authentication
- Implement image compression
- Add multiple file upload
- Set up CloudFront CDN
