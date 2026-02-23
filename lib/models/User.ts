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
    credits: {
      type: Number,
      default: 5000,
      min: 0,
    },
  },
  { timestamps: true },
);

export const DUMMY_USERS_FOR_TESTING = [
  {
    email: "test1@example.com",
    password: "Test@123",
    name: "Player One",
    credits: 10000,
  },
  {
    email: "test2@example.com",
    password: "Test@123",
    name: "Player Two",
    credits: 5000,
  },
  {
    email: "test3@example.com",
    password: "Test@123",
    name: "Rich Player",
    credits: 50000,
  },
  {
    email: "test4@example.com",
    password: "Test@123",
    name: "Demo User",
    credits: 3000,
  },
];

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.userId) {
    this.userId = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
});

userSchema.methods.comparePassword = async function (
  passwordToCompare: string,
) {
  return await bcrypt.compare(passwordToCompare, this.password);
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
