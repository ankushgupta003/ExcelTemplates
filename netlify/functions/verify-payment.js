// This Netlify Function verifies the Razorpay payment and sends an email
// to the customer with the product link.

const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      product_name,
      download_link,
      customer_email,
    } = JSON.parse(event.body);

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Creating the signature to verify
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Check if the generated signature matches the one from Razorpay
    if (generated_signature !== razorpay_signature) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Payment verification failed",
        }),
      };
    }

    // --- PAYMENT VERIFIED: NOW SEND THE EMAIL ---

    // This transporter will use your Gmail account to send emails.
    // You must create an App Password for this to work.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail email address
        pass: process.env.GMAIL_PASS, // Your Gmail App Password
      },
    });

    // Email content and recipient
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: customer_email, // Now using the email passed from the frontend
      subject: `Your ${product_name} Template`,
      html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
                    <h2 style="color: #333;">Thank You for Your Purchase!</h2>
                    <p style="color: #555;">Hi there,</p>
                    <p style="color: #555;">
                        Your payment for **${product_name}** was successful.
                    </p>
                    <p style="color: #555;">
                        You can download your template from the link below:
                    </p>
                    <a href="${download_link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
                        Download Your Template
                    </a>
                    <p style="color: #888; margin-top: 20px;">
                        If you have any questions, please reply to this email.
                    </p>
                </div>
            `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Payment verified and email sent!",
      }),
    };
  } catch (error) {
    console.error("Error verifying payment or sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
