import mongoose, { Schema } from "mongoose";

const userScheme = new Schema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        token: { type: String },
        linkedin: { type: String },
        designation: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date }
    }
)

const User = mongoose.model("User", userScheme);

export { User };
