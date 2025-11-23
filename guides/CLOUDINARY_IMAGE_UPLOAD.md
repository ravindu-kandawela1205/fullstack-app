# Cloudinary Image Upload Guide

## Overview
Product and User image upload using Cloudinary CDN.

## Files Modified

### Backend
- `ExpressServer/models/product.js` - Added `imageUrl: String`
- `ExpressServer/models/user.js` - Already has `image: String`

### Frontend
- `ReactApp/index.html` - Added Cloudinary script
- `ReactApp/src/components/CloudinaryUpload.tsx` - Created upload component
- `ReactApp/src/components/ProductDialog.tsx` - Added image upload
- `ReactApp/src/components/customUi/UserFormDialog.tsx` - Added image upload
- `ReactApp/src/pages/LocalUsersTable.tsx` - Added image to API calls
- `ReactApp/src/types/product.ts` - Added imageUrl field

## Setup

1. **Create Cloudinary Account**: https://cloudinary.com
2. **Create Upload Preset**: Settings → Upload → Add preset (Unsigned mode)
3. **Update Config** in `ReactApp/src/components/CloudinaryUpload.tsx`:
```typescript
const CLOUD_NAME = "your-cloud-name";
const UPLOAD_PRESET = "your-preset-name";
```

## How It Works

### Product Image
1. User opens Add/Edit Product dialog
2. CloudinaryUpload component at top
3. Upload image → Cloudinary returns URL
4. URL saved in `imageUrl` field
5. POST/PUT to `/api/products` with imageUrl
6. MongoDB saves URL

### User Image
1. User opens Add/Edit User dialog
2. CloudinaryUpload component at top
3. Upload image → Cloudinary returns URL
4. URL saved in `image` field
5. POST/PUT to `/api/users` with image
6. MongoDB saves URL

## Data Flow
```
CloudinaryUpload → Cloudinary API → URL → Form State → Backend API → MongoDB
```

## Features
- Upload from device
- Paste image URL
- Image preview
- Remove image
- Square crop (1:1)
- Max 5MB
- Formats: jpg, png, gif, webp
