# AWS S3 User Image Upload Guide

## Overview
Users upload images to AWS S3, Products use Cloudinary.

## Backend Setup

### 1. Install Dependencies
```bash
cd ExpressServer
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. AWS Configuration
**File:** `ExpressServer/.env`
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-bucket-name
```

### 3. Files Created
- `ExpressServer/config/s3.js` - S3 client config
- `ExpressServer/controllers/upload.controller.js` - Presigned URL endpoint
- `ExpressServer/route/upload.routes.js` - Upload routes
- `ExpressServer/index.js` - Added upload routes

## Frontend Setup

### Files Created/Modified
- `ReactApp/src/components/S3Upload.tsx` - S3 upload component
- `ReactApp/src/components/customUi/UserFormDialog.tsx` - Uses S3Upload
- `ReactApp/src/components/ProductDialog.tsx` - Uses CloudinaryUpload

## How It Works

### User Image (S3)
1. User selects image in UserFormDialog
2. Frontend requests presigned URL from `/api/upload/presigned-url`
3. Backend generates presigned URL (valid 5 min)
4. Frontend uploads directly to S3 using presigned URL
5. S3 URL saved to MongoDB user.image field

### Product Image (Cloudinary)
1. User selects image in ProductDialog
2. Cloudinary widget uploads to Cloudinary
3. Cloudinary URL saved to MongoDB product.imageUrl field

## AWS S3 Setup Steps (Detailed)

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow signup process (requires credit card, but S3 has free tier)

### Step 2: Create S3 Bucket
1. Login to AWS Console: https://console.aws.amazon.com/
2. Search for "S3" in top search bar
3. Click "Create bucket"
4. **Bucket name**: Enter unique name (e.g., `myapp-user-images-2024`)
5. **AWS Region**: Select region (e.g., `us-east-1`) - This is your `AWS_REGION`
6. **Block Public Access**: UNCHECK "Block all public access" (we need public read)
7. Click "Create bucket"

### Step 3: Configure Bucket CORS
1. Click on your bucket name
2. Go to "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and paste:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "POST", "GET"],
       "AllowedOrigins": ["http://localhost:5173", "http://localhost:5174"],
       "ExposeHeaders": []
     }
   ]
   ```
5. Click "Save changes"

### Step 4: Configure Bucket Policy (Public Read)
1. Still in "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit" and paste (replace `your-bucket-name`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```
4. Click "Save changes"

### Step 5: Create IAM User (Get Access Keys)
1. In AWS Console, search for "IAM"
2. Click "Users" in left sidebar
3. Click "Create user"
4. **User name**: Enter name (e.g., `s3-upload-user`)
5. Click "Next"
6. **Permissions**: Select "Attach policies directly"
7. Search and select "AmazonS3FullAccess"
8. Click "Next" → "Create user"

### Step 6: Create Access Key
1. Click on the user you just created
2. Go to "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Next" → "Create access key"
7. **IMPORTANT**: Copy both:
   - **Access key ID** → This is your `AWS_ACCESS_KEY_ID`
   - **Secret access key** → This is your `AWS_SECRET_ACCESS_KEY`
8. Click "Done"

### Step 7: Update .env File
```env
AWS_REGION=us-east-1                    # From Step 2
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  # From Step 6
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # From Step 6
AWS_S3_BUCKET=myapp-user-images-2024    # From Step 2
```

### Summary of What You Need:
- **AWS_REGION**: Selected when creating bucket (e.g., `us-east-1`, `us-west-2`, `eu-west-1`)
- **AWS_ACCESS_KEY_ID**: From IAM user access key creation
- **AWS_SECRET_ACCESS_KEY**: From IAM user access key creation (shown only once!)
- **AWS_S3_BUCKET**: Your bucket name from Step 2

## Data Flow

### S3 Upload Flow
```
UserFormDialog → Request Presigned URL → Backend generates URL → 
Frontend uploads to S3 → S3 returns URL → Save to MongoDB
```

### Cloudinary Upload Flow
```
ProductDialog → Cloudinary Widget → Upload to Cloudinary → 
Cloudinary returns URL → Save to MongoDB
```

## API Endpoint

**POST** `/api/upload/presigned-url`

Request:
```json
{
  "fileName": "image.jpg",
  "fileType": "image/jpeg"
}
```

Response:
```json
{
  "uploadUrl": "https://bucket.s3.region.amazonaws.com/key?signature",
  "fileUrl": "https://bucket.s3.region.amazonaws.com/key"
}
```

## Security Notes

- Presigned URLs expire in 5 minutes
- Only authenticated users can request presigned URLs (add auth middleware if needed)
- S3 bucket should have CORS configured
- Use IAM user with minimal permissions
- Never commit AWS credentials to git

## File Paths

```
Backend:
├── ExpressServer/config/s3.js
├── ExpressServer/controllers/upload.controller.js
├── ExpressServer/route/upload.routes.js
├── ExpressServer/index.js (modified)
└── ExpressServer/.env (add AWS vars)

Frontend:
├── ReactApp/src/components/S3Upload.tsx
├── ReactApp/src/components/CloudinaryUpload.tsx (products)
├── ReactApp/src/components/customUi/UserFormDialog.tsx (uses S3)
└── ReactApp/src/components/ProductDialog.tsx (uses Cloudinary)
```
