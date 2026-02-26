import nodemailer from "nodemailer";

// Create transporter - using Gmail as example
// For production, use environment variables
const createTransporter = () => {
    // Option 1: Gmail (requires app password)
    // Uncomment and add your credentials
    /*
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-app-password'
        }
    });
    */

    // Option 2: Ethereal (for testing/demo - creates fake inbox)
    // This will be created dynamically in sendResetEmail
    return null;
};

export const sendResetEmail = async (email, resetToken, username) => {
    try {
        let transporter;
        
        // Check if production email is configured
        const useProductionEmail = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
        
        if (useProductionEmail) {
            // PRODUCTION: Use Gmail or configured email service
            transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE || 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            console.log('Using production email service');
        } else {
            // DEVELOPMENT: Use Ethereal test email (viewable in browser)
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('Using Ethereal test email service');
        }

        // Use environment variable for frontend URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: '"Video Meet Support" <support@videomeet.com>',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hi <strong>${username}</strong>,</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    <div style="margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background-color: #1976d2; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${resetLink}</p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        This link will expire in 1 hour. If you didn't request this, please ignore this email.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Password reset email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Sent to:', email);
        
        // For Ethereal test emails, show preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log('Preview URL:', previewUrl);
        }
        
        return {
            success: true,
            messageId: info.messageId,
            previewUrl: previewUrl
        };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
