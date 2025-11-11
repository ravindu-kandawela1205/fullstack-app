import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

console.log('Testing MongoDB connection...');
console.log('MongoDB URL:', MONGO_URL);

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Test creating a user
    const userSchema = new mongoose.Schema({
      name: { type: String, trim: true, required: true, minlength: 2, maxlength: 60 },
      email: { type: String, unique: true, required: true, lowercase: true, index: true },
      passwordHash: { type: String, required: true },
    }, { timestamps: true });
    
    const User = mongoose.model("autousers", userSchema);
    
    // Try to create a test user
    User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword'
    }).then(user => {
      console.log('✅ Test user created:', user._id);
      process.exit(0);
    }).catch(err => {
      if (err.code === 11000) {
        console.log('ℹ️ Test user already exists (duplicate email)');
      } else {
        console.error('❌ Error creating test user:', err);
      }
      process.exit(0);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });