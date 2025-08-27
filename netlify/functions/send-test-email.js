// This is a test function to send an email using Nodemailer
// without a payment verification step.

const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  // We only need to handle GET requests for this test
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    // Get the recipient email and download link from the URL query parameters
    const customer_email = event.queryStringParameters.email;
    const download_link = event.queryStringParameters.link;

    // Ensure both parameters are provided
    if (!customer_email || !download_link) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required query parameters: 'email' and 'link'.",
        }),
      };
    }

    // Create the Nodemailer transporter using your environment variables
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
      to: customer_email,
      subject: `[TEST] Your Sample Template`,
      html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
                    <h2 style="color: #333;">Test Email Sent Successfully!</h2>
                    <p style="color: #555;">Hi,</p>
                    <p style="color: #555;">
                        This is a test email to verify the Nodemailer integration.
                        If you can see this, everything is working correctly.
                    </p>
                    <p style="color: #555;">
                        Here is your test download link:
                    </p>
                    <a href="${download_link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
                        Download Your Test File
                    </a>
                    <p style="color: #888; margin-top: 20px;">
                        Please ignore this email if you did not request it.
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
        message: "Test email sent successfully!",
      }),
    };
  } catch (error) {
    console.error("Error sending test email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
