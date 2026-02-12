import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.userId) {
    this.userId = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  passwordToCompare: string,
) {
  return await bcrypt.compare(passwordToCompare, this.password);
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
