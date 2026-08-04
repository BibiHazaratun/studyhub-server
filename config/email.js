const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (toEmail, resetLink) => {
  await transporter.sendMail({
    from: `"StudyHub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your StudyHub password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your StudyHub account.</p>
        <p><a href="${resetLink}" style="background:#16a34a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">Reset Password</a></p>
        <p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendResetEmail };