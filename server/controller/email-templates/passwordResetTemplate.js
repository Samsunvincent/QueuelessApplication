export function passwordResetEmailTemplate (name, token) {
    const resetLink = `https://your-frontend-url.com/reset-password/${token}`;//INSTEAD OF THIS ADD THE FRONTEND LINK WHILE I CREATE THE FRONTEND UPDATE FORM 
    

    return `
        <h2>Hello ${name},</h2>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetLink}" target="_blank"
           style="background:#4CAF50;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;">
           Reset Password
        </a>
        <p>This link expires in <b>15 minutes</b>.</p>
        <p>If you didn’t request this, please ignore the email.</p>
    `;
}
