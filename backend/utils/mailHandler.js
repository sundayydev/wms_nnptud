const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

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

async function sendLowStockMail(to, productName, warehouseName, quantity) {
  const mailOptions = {
    from: `"WMS System" <${process.env.MAIL_USER}>`,
    to,
    subject: ` Cảnh báo tồn kho thấp: ${productName}`,
    html: `
      <h2> Cảnh báo tồn kho thấp</h2>
      <p>Hệ thống WMS phát hiện sản phẩm dưới ngưỡng tồn kho tối thiểu.</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
        <tr><td><strong>Sản phẩm</strong></td><td>${productName}</td></tr>
        <tr><td><strong>Kho</strong></td><td>${warehouseName}</td></tr>
        <tr><td><strong>Số lượng còn lại</strong></td><td style="color:red;"><strong>${quantity}</strong></td></tr>
      </table>
      <p>Vui lòng kiểm tra và nhập hàng kịp thời.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi mail cảnh báo tồn kho thấp tới: ${to}`);
  } catch (err) {
    console.error('Gửi mail cảnh báo thất bại:', err.message);
  }
}

module.exports = { sendMail, sendLowStockMail };
