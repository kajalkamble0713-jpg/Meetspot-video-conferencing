import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt"

import crypto from "crypto"
import { Meeting } from "../models/meeting.model.js";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/; // min 8, 1 uppercase, 1 number, 1 special
const SIMPLE_EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/; // must contain @ and domain


const login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" })
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }


        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
    const { name, username, password, email, linkedin, designation } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "username, password and email are required" })
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Password must be at least 8 characters, include at least one uppercase letter, one number, and one special character."
        })
    }

    // Validate email
    if (!SIMPLE_EMAIL_REGEX.test(email)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Email must be a valid address and contain @."
        })
    }

    // LinkedIn (optional): simple pass-through; format validated by middleware
    let linkedinToSave = undefined;
    if (linkedin && linkedin.trim() !== "") {
        linkedinToSave = linkedin.trim();
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(httpStatus.FOUND).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: hashedPassword,
            linkedin: linkedinToSave,
            designation: designation
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered" })

    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }

}

const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username }).select('username email linkedin designation');
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'User Not Found' });
        }
        return res.status(httpStatus.OK).json(user);
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}


const forgotPassword = async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: "Please provide both username and email" });
    }

    try {
        // Find user with matching username AND email
        const user = await User.findOne({ username, email });
        
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ 
                message: "Username and email do not match our records" 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        
        // Hash token before saving to database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Save hashed token and expiry (1 hour from now)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email with unhashed token
        const { sendResetEmail } = await import("../utils/emailService.js");
        await sendResetEmail(user.email, resetToken, user.username);

        return res.status(httpStatus.OK).json({ 
            message: "Password reset email sent successfully",
            email: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") // Masked email
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(newPassword)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Password must be at least 8 characters, include at least one uppercase letter, one number, and one special character."
        });
    }

    try {
        // Hash the token from URL to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token and not expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: "Invalid or expired reset token" 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(httpStatus.OK).json({ 
            message: "Password reset successful. You can now login with your new password." 
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
};

export { login, register, getUserHistory, addToHistory, getProfile, forgotPassword, resetPassword }
