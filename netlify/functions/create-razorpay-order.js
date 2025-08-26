// A Netlify Function to create a Razorpay order securely using a direct API call.
// This file should be placed in the `netlify/functions/` directory.

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

    // 🚨 ADDED LOGGING: Check if environment variables are present
    console.log(
      "RAZORPAY_KEY_ID:",
      process.env.RAZORPAY_KEY_ID ? "Found" : "Not Found"
    );
    console.log(
      "RAZORPAY_KEY_SECRET:",
      process.env.RAZORPAY_KEY_SECRET ? "Found" : "Not Found"
    );

    // Construct the authorization header
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const orderData = {
      amount: amount,
      currency: "INR",
      receipt: "receipt_order_" + Math.floor(Math.random() * 100000),
      notes: {
        product_name: product_name,
      },
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Razorpay API Error:", errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Razorpay API Error: ${errorText}` }),
      };
    }

    const order = await response.json();

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
