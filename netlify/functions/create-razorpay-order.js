// A Netlify Function to create a Razorpay order securely.
// This file should be placed in the `netlify/functions/` directory.

const Razorpay = require("razorpay");

// Ensure you have configured your environment variables in Netlify
// Process.env.RAZORPAY_KEY_ID
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
    const { amount, product_name } = JSON.parse(event.body);

    // Ensure both amount and product_name are present
    if (!amount || !product_name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required parameters: amount or product_name",
        }),
      };
    }

    // Initialize Razorpay with your secret key
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount, // amount in the smallest currency unit (e.g., paisa)
      currency: "INR",
      receipt: "receipt_order_" + Math.floor(Math.random() * 100000), // Unique receipt
      notes: {
        product_name: product_name,
        // You can add other notes here, like customer ID
      },
    };

    // Create the order on the Razorpay server
    const order = await instance.orders.create(options);

    // Return the order details to the client
    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
