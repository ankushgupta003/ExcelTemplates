// A Netlify Function to verify a Razorpay payment signature.
// This file should be placed in the `netlify/functions/` directory.

const crypto = require("crypto");

// Ensure you have configured your environment variable in Netlify
// Process.env.RAZORPAY_KEY_SECRET

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      JSON.parse(event.body);

    // Check for missing parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Missing required payment details",
        }),
      };
    }

    // Generate the expected signature using your secret key
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Compare the generated signature with the one from Razorpay
    const isSignatureValid = generated_signature === razorpay_signature;

    if (isSignatureValid) {
      // Payment is verified. Now you can perform the fulfillment logic,
      // such as sending the Google Sheets URL to the user.
      console.log("Payment successfully verified. Sending email to customer.");

      // In a real-world scenario, you would send an email here.
      // For now, we'll just return a success message.
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "Payment verified successfully!",
        }),
      };
    } else {
      // Signature mismatch. This indicates a potential security issue.
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Invalid signature" }),
      };
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};
