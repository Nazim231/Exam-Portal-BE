export default (username, email, password) => {
    return `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
            <h2 style="text-align: center; color: #333;">Account Created</h2>
            <p>Dear <strong>${username}</strong>,</p>
            <p>ExamNest welcomes you as a student to attend the online exams over our portal, below are the credentials for the same:</p>
            <div style="text-align: center; margin: 20px 0;">
            <p><b>Email:</b> ${` ${email}`}</p>
            <p><b>Password:</b> ${` ${password}`}</p>
            </div>
            <p>Please do not share these credentials with anyone.</p>
            <p>Thank you,<br><strong>ExamNest</strong></p>
        </div>
    </div>
    `;
};
