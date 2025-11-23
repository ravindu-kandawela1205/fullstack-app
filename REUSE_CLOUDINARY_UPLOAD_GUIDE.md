# How to Reuse CloudinaryUpload Component in Any Project

## Overview
This guide shows how to copy and use the CloudinaryUpload component in any React project for image uploads.

---

## What You Need

### 1. Cloudinary Account (Free)
- Sign up at https://cloudinary.com
- Get your **Cloud Name** from dashboard
- Create an **Unsigned Upload Preset**

### 2. Files to Copy
```
ReactApp/src/components/CloudinaryUpload.tsx  ← Main component
ReactApp/src/components/ui/button.tsx         ← UI button component
ReactApp/src/components/ui/input.tsx          ← UI input component
```

---

## Step-by-Step Implementation

### Step 1: Setup Cloudinary Account

1. Go to https://cloudinary.com and sign up
2. Login to dashboard
3. Note your **Cloud Name** (e.g., "dvjvsbkoy")
4. Go to **Settings → Upload**
5. Click **"Add upload preset"**
6. Set **Signing Mode** to **"Unsigned"**
7. Name it (e.g., "products")
8. Click **Save**

---

### Step 2: Copy CloudinaryUpload Component

**Create file**: `src/components/CloudinaryUpload.tsx`

```typescript
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const CLOUD_NAME = "YOUR_CLOUD_NAME";      // ← Replace with your cloud name
const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET"; // ← Replace with your preset name

export default function CloudinaryUpload({ value, onChange }: CloudinaryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      onChange(data.secure_url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Browse"}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {value && (
        <img src={value} alt="Preview" className="object-cover w-20 h-20 mt-2 rounded" />
      )}
    </div>
  );
}
```

**Update these lines**:
```typescript
const CLOUD_NAME = "dvjvsbkoy";      // Your cloud name
const UPLOAD_PRESET = "products";    // Your preset name
```

---

### Step 3: Use in Your Form

**Example**: User Profile Form

**Create file**: `src/components/UserProfileForm.tsx`

```typescript
import { useState } from "react";
import CloudinaryUpload from "./CloudinaryUpload";

export default function UserProfileForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: ""  // ← Stores Cloudinary URL
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send to your API
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label>Email</label>
        <input
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label>Avatar</label>
        <CloudinaryUpload
          value={formData.avatar}
          onChange={(url) => setFormData({ ...formData, avatar: url })}
        />
      </div>

      <button type="submit">Save Profile</button>
    </form>
  );
}
```

---

## Complete Project Structure

```
your-project/
├── src/
│   ├── components/
│   │   ├── CloudinaryUpload.tsx       ← Copy this
│   │   ├── UserProfileForm.tsx        ← Your form using upload
│   │   └── ui/
│   │       ├── button.tsx             ← UI component
│   │       └── input.tsx              ← UI component
│   └── App.tsx
├── package.json
└── tsconfig.json
```

---

## Different Use Cases

### Use Case 1: Product Form

**File**: `src/components/ProductForm.tsx`

```typescript
import { useState } from "react";
import CloudinaryUpload from "./CloudinaryUpload";

export default function ProductForm() {
  const [product, setProduct] = useState({
    name: "",
    price: 0,
    image: ""  // ← Product image URL
  });

  return (
    <form>
      <input
        placeholder="Product Name"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />
      
      <CloudinaryUpload
        value={product.image}
        onChange={(url) => setProduct({ ...product, image: url })}
      />
      
      <button type="submit">Add Product</button>
    </form>
  );
}
```

### Use Case 2: Blog Post Form

**File**: `src/components/BlogPostForm.tsx`

```typescript
import { useState } from "react";
import CloudinaryUpload from "./CloudinaryUpload";

export default function BlogPostForm() {
  const [post, setPost] = useState({
    title: "",
    content: "",
    coverImage: ""  // ← Blog cover image URL
  });

  return (
    <form>
      <input
        placeholder="Title"
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
      />
      
      <textarea
        placeholder="Content"
        value={post.content}
        onChange={(e) => setPost({ ...post, content: e.target.value })}
      />
      
      <CloudinaryUpload
        value={post.coverImage}
        onChange={(url) => setPost({ ...post, coverImage: url })}
      />
      
      <button type="submit">Publish</button>
    </form>
  );
}
```

### Use Case 3: Multiple Images (Gallery)

**File**: `src/components/GalleryForm.tsx`

```typescript
import { useState } from "react";
import CloudinaryUpload from "./CloudinaryUpload";

export default function GalleryForm() {
  const [images, setImages] = useState<string[]>([]);

  const addImage = (url: string) => {
    setImages([...images, url]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3>Gallery Images</h3>
      
      {/* Add new image */}
      <CloudinaryUpload
        value=""
        onChange={(url) => {
          addImage(url);
        }}
      />
      
      {/* Display all images */}
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index}>
            <img src={url} alt={`Image ${index}`} />
            <button onClick={() => removeImage(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Backend Integration

### Node.js + Express + MongoDB

**File**: `server/models/Product.js`

```javascript
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String  // ← Stores Cloudinary URL
});

module.exports = mongoose.model("Product", productSchema);
```

**File**: `server/routes/products.js`

```javascript
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Create product with image
router.post("/", async (req, res) => {
  const { name, price, image } = req.body;
  
  const product = new Product({
    name,
    price,
    image  // ← Cloudinary URL from frontend
  });
  
  await product.save();
  res.json(product);
});

// Get products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

module.exports = router;
```

### Python + Flask + MongoDB

**File**: `app/models.py`

```python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["myapp"]
products = db["products"]

def create_product(name, price, image):
    product = {
        "name": name,
        "price": price,
        "image": image  # Cloudinary URL
    }
    products.insert_one(product)
    return product
```

**File**: `app/routes.py`

```python
from flask import Flask, request, jsonify
from models import create_product

app = Flask(__name__)

@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.json
    product = create_product(
        name=data["name"],
        price=data["price"],
        image=data["image"]  # Cloudinary URL from frontend
    )
    return jsonify(product)
```

---

## File Dependencies

### What CloudinaryUpload Needs

```
CloudinaryUpload.tsx
├── React (useState, useRef)
├── Button component (UI)
├── Input component (UI)
└── Cloudinary API (external)
```

### What Your Form Needs

```
YourForm.tsx
├── React (useState)
└── CloudinaryUpload.tsx
```

### Complete Dependency Tree

```
App.tsx
  └── YourForm.tsx
      └── CloudinaryUpload.tsx
          ├── Button.tsx
          ├── Input.tsx
          └── Cloudinary API
              └── Returns URL
                  └── Saved in YourForm state
                      └── Sent to Backend API
                          └── Saved in Database
```

---

## Customization Options

### 1. Change Accepted File Types

```typescript
<input
  type="file"
  accept="image/*"           // All images
  // OR
  accept="image/png,image/jpeg"  // Only PNG and JPEG
  // OR
  accept="video/*"           // Videos
  // OR
  accept=".pdf,.doc,.docx"   // Documents
/>
```

### 2. Add File Size Limit

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert("File too large. Max 5MB");
    return;
  }

  // Continue with upload...
};
```

### 3. Add Loading Indicator

```typescript
return (
  <div>
    <Button disabled={uploading}>
      {uploading ? (
        <>
          <Spinner /> Uploading...
        </>
      ) : (
        "Browse"
      )}
    </Button>
    {uploading && <ProgressBar />}
  </div>
);
```

### 4. Add Error Handling

```typescript
const [error, setError] = useState("");

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  try {
    setError("");
    // Upload code...
  } catch (error) {
    setError("Upload failed. Please try again.");
  }
};

return (
  <div>
    <CloudinaryUpload ... />
    {error && <p className="text-red-500">{error}</p>}
  </div>
);
```

### 5. Multiple Upload Presets

```typescript
interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  preset?: string;  // ← Optional preset
}

export default function CloudinaryUpload({ value, onChange, preset = "default" }) {
  const UPLOAD_PRESET = preset;
  // Rest of code...
}

// Usage
<CloudinaryUpload
  value={avatar}
  onChange={setAvatar}
  preset="avatars"  // ← Use different preset
/>
```

---

## Environment Variables (Recommended)

### 1. Create `.env` file

```env
VITE_CLOUDINARY_CLOUD_NAME=dvjvsbkoy
VITE_CLOUDINARY_UPLOAD_PRESET=products
```

### 2. Update CloudinaryUpload.tsx

```typescript
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
```

### 3. Add to `.gitignore`

```
.env
.env.local
```

---

## Quick Start Checklist

- [ ] Create Cloudinary account
- [ ] Get Cloud Name
- [ ] Create unsigned upload preset
- [ ] Copy `CloudinaryUpload.tsx` to your project
- [ ] Update `CLOUD_NAME` and `UPLOAD_PRESET`
- [ ] Copy UI components (Button, Input) or use your own
- [ ] Import CloudinaryUpload in your form
- [ ] Add state for image URL
- [ ] Use `<CloudinaryUpload value={url} onChange={setUrl} />`
- [ ] Submit form with image URL to backend
- [ ] Save URL in database
- [ ] Display images using saved URLs

---

## Common Issues & Solutions

### Issue 1: "Upload preset not found"
**Solution**: Create unsigned preset in Cloudinary settings

### Issue 2: "CORS error"
**Solution**: Cloudinary allows all origins by default. Check preset settings.

### Issue 3: "Button/Input not found"
**Solution**: Install shadcn/ui or create your own Button/Input components

### Issue 4: "Image not displaying"
**Solution**: Check if URL is valid. Open URL in browser to verify.

### Issue 5: "Upload too slow"
**Solution**: Resize image before upload or use Cloudinary transformations

---

## Alternative: Without UI Components

If you don't have Button/Input components:

```typescript
export default function CloudinaryUpload({ value, onChange }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_PRESET");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      onChange(data.secure_url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Image URL"
        style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{ padding: "8px 16px", marginLeft: "8px" }}
      >
        {uploading ? "Uploading..." : "Browse"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {value && (
        <img
          src={value}
          alt="Preview"
          style={{ width: "80px", height: "80px", objectFit: "cover", marginTop: "8px" }}
        />
      )}
    </div>
  );
}
```

---

## Summary

### Files You Need
1. `CloudinaryUpload.tsx` - Main component
2. Your form component - Uses CloudinaryUpload
3. Backend model - Stores image URL
4. Backend route - Saves/retrieves data

### Data Flow
```
User → CloudinaryUpload → Cloudinary API → URL → Form State → Backend → Database
```

### Key Points
- CloudinaryUpload is reusable in any form
- Only stores URLs, not images
- Works with any backend (Node, Python, PHP, etc.)
- No server storage needed
- Free tier: 25GB storage + 25GB bandwidth
- Images delivered via global CDN

### To Reuse
1. Copy component file
2. Update cloud name and preset
3. Import in your form
4. Pass `value` and `onChange` props
5. Done!
