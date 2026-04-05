const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Gửi email reset password
 * @param {string} to - Địa chỉ email nhận
 * @param {string} resetUrl - Link reset password
 */
async function sendMail(to, resetUrl) {
  const mailOptions = {
    from: `"WMS System" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Đặt lại mật khẩu',
    html: `
            <h2>Yêu cầu đặt lại mật khẩu</h2>
            <p>Nhấn vào link bên dưới để đặt lại mật khẩu (hiệu lực 10 phút):</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Gửi mail thất bại:', err.message);
  }
}

module.exports = { sendMail };
