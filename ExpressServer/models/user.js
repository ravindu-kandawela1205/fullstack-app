import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {

    firstname: { type: String, required : true, trim: true },
    lastname: { type: String, required : true, trim: true },
    age: { type: Number, required : true, trim: true },
    gender: { type: String, required : true, trim: true },
    email: { type: String, required : true, trim: true },
    birthdate: { type: String, required : true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("users", userSchema);
