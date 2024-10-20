export default (username, otp) => {
    return `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
            <h2 style="text-align: center; color: #333;">Email Verification</h2>
            <p>Dear <strong>${username}</strong>,</p>
            <p>To verify your email address, please use the following One-Time Password (OTP):</p>
            <div style="text-align: center; margin: 20px 0;">
                <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${otp}</p>
            </div>
            <p>This OTP is valid for the next <strong>15 minutes</strong>. Please do not share this code with anyone.</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <p>Thank you,<br><strong>ExamNest</strong></p>
        </div>
    </div>
    `;
};
