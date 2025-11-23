# How to Get AWS Access Keys

## Quick Steps

### 1. Login to AWS Console
- Go to: https://console.aws.amazon.com/
- Login with your AWS account

### 2. Open IAM Service
- In the top search bar, type **IAM**
- Click on **IAM** (Identity and Access Management)

### 3. Create New User (if you don't have one)
- Click **Users** in left sidebar
- Click **Create user** button
- Enter username: `s3-upload-user`
- Click **Next**

### 4. Attach S3 Permissions
- Select **Attach policies directly**
- In search box, type: `AmazonS3FullAccess`
- Check the box next to **AmazonS3FullAccess**
- Click **Next**
- Click **Create user**

### 5. Create Access Key
- Click on the user you just created
- Click **Security credentials** tab
- Scroll down to **Access keys** section
- Click **Create access key**
- Select **Application running outside AWS**
- Click **Next**
- Click **Create access key**

### 6. Copy Your Credentials
You'll see:
```
Access key ID: AKIAIOSFODNN7EXAMPLE
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**IMPORTANT**: 
- Copy both values NOW
- Secret key is shown ONLY ONCE
- If you lose it, you must create a new access key

### 7. Update .env File
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## If You Already Have a User

### Option A: Create New Access Key
1. Go to IAM → Users
2. Click on your existing user
3. Go to **Security credentials** tab
4. Scroll to **Access keys**
5. Click **Create access key**
6. Follow steps 5-7 above

### Option B: Find Existing Keys
**You CANNOT view existing secret keys**. You can only:
- See the Access Key ID
- Delete old keys
- Create new keys

If you lost your secret key, you must create a new access key.

## Visual Guide

```
AWS Console
    ↓
Search "IAM"
    ↓
Users → Create user
    ↓
Attach "AmazonS3FullAccess" policy
    ↓
Click on user → Security credentials
    ↓
Create access key
    ↓
Copy Access Key ID + Secret Access Key
    ↓
Paste in .env file
```

## Common Regions
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-south-1` - Asia Pacific (Mumbai)

## Security Tips
- Never commit .env file to git
- Never share your secret access key
- Use IAM user (not root account)
- Delete unused access keys
- Rotate keys regularly

## Troubleshooting

**"Access Denied" error?**
- Make sure user has `AmazonS3FullAccess` policy
- Check bucket policy allows public read

**"Invalid credentials" error?**
- Double-check no extra spaces in .env
- Make sure you copied the full key
- Try creating a new access key

**Can't find IAM?**
- Make sure you're logged into AWS Console
- Use search bar at top: type "IAM"
- Direct link: https://console.aws.amazon.com/iam/
