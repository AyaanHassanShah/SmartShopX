const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const isGmail = (process.env.SMTP_HOST || "").includes("gmail");
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: parseInt(process.env.SMTP_PORT) === 465 || isGmail, // Port 465 is secure
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || "Smart Shop X"} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);
  console.log("Email Sent Successfully: %s", info.messageId);
};

const sendOrderConfirmationEmail = async (user, order) => {
  const message = `
    Hi ${user.name},
    
    Thank you for your order at Smart Shop X!
    
    Order ID: ${order._id}
    Total Price: $${order.totalPrice}
    Status: ${order.status}
    
    We are processing your order and will notify you once it has been shipped.
    
    Best regards,
    The Smart Shop X Team
  `;

  const html = `
    <div style="font-family: 'Inter', sans-serif; background: #030712; color: white; padding: 60px; border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #ea580c; font-size: 32px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase;">Order Confirmed.</h1>
        <p style="color: #9ca3af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.2em;">Smart Shop X Inventory Alpha</p>
      </div>

      <div style="background: rgba(255,255,255,0.02); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 40px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${user.name},</p>
        <p style="color: #9ca3af; line-height: 1.6;">Your investment in elite footwear has been secured. Our team is currently preparing your assets for priority dispatch.</p>
        
        <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.05);">
           <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
             <span style="color: #6b7280; font-size: 12px; font-weight: 900; text-transform: uppercase;">Order ID</span>
             <span style="font-family: monospace; color: white;">${order._id}</span>
           </div>
           <div style="display: flex; justify-content: space-between;">
             <span style="color: #6b7280; font-size: 12px; font-weight: 900; text-transform: uppercase;">Total Portfolio</span>
             <span style="color: #ea580c; font-size: 24px; font-weight: 900;">$${order.totalPrice}</span>
           </div>
        </div>
      </div>

      <div style="text-align: center;">
        <p style="color: #4b5563; font-size: 12px;">This is an automated transmission from Smart Shop X Systems.</p>
        <p style="color: #4b5563; font-size: 12px;">&copy; 2026 SMART SHOP X. Beyond Limits.</p>
      </div>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: "ASSET SECURED: Order Confirmation - Smart Shop X",
    message,
    html
  });
};

module.exports = { sendEmail, sendOrderConfirmationEmail };
