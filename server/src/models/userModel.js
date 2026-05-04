import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default:
      "https://m.media-amazon.com/images/M/MV5BYmQwYTc1ZDEtMzU3My00OTIzLWE1YmEtYmUyMmMzZTI2ZWNlXkEyXkFqcGdeQXVyOTgwMzk1MTA@._V1_.jpg",
  },
  username: {
    type: String,
    required: true,
    minlength: [3, "username can't be less than 3 Characters"],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Provide a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["doctor", "patient", "diagnostic_center", "admin", "government_analyst"],
    default: "patient",
  },
  // Doctor-specific fields
  specialty: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  // Patient-specific fields
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  // Diagnostic center-specific fields
  centerName: {
    type: String,
  },
  centerLicense: {
    type: String,
  },
  // Links to patient records (for doctors and diagnostic centers)
  patients: [{
    type: Schema.Types.ObjectId,
    ref: "Patient",
  }],
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model("User", userSchema);

export default User;
