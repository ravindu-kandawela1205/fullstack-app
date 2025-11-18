import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, minlength: 2, maxlength: 60 },
    email: { type: String, unique: true, required: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    profileImage: { type: String, default: null },
    role: {
      type: String,
      default: "user" // every new user is normal user
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("authusers", userSchema);
