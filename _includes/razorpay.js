      <script>
      document.getElementById('emailForm').onsubmit = function(e) {
          e.preventDefault(); // Prevent form submission

          const customerEmail = document.getElementById('customerEmailInput').value;
          const paymentBtn = document.getElementById('paymentBtn');
          const paymentBtnText = document.getElementById('paymentBtnText');
          const paymentBtnSpinner = document.getElementById('paymentBtnSpinner');

          // Disable button and show spinner
          paymentBtn.disabled = true;
          paymentBtnText.classList.add('d-none');
          paymentBtnSpinner.classList.remove('d-none');

          // Hide the modal after getting the email
          const emailModal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
          emailModal.hide();

          // Updated backend URL for Netlify Function
          const backendUrl = "/.netlify/functions/create-razorpay-order";
          // Get the price from the Jekyll variable and convert it to paisa
          const price = {{ page.price }} * 100;
          const name = "{{ page.title }}";
          const downloadLink = "{{ page.download_link }}"; // Get the download link from Jekyll

          // Log the payload to the console before sending
          console.log("Sending payload to backend:", { amount: price, product_name: name });

          fetch(backendUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  amount: price,
                  product_name: name
              }),
          })
          .then(response => {
              if (!response.ok) {
                  // Log the response text if the request was not successful
                  return response.text().then(text => {
                      console.error("Backend Error:", text);
                      throw new Error("HTTP error " + response.status + ": " + text);
                  });
              }
              return response.json();
          })
          .then(order => {
              if (order.id) {
                  const options = {
                      "key": "rzp_test_RA2NakVSYF1k5z", // Replace with your actual Razorpay Key ID
                      "amount": order.amount,
                      "currency": "INR", // Change to USD or other currency if needed
                      "name": "The Sheet Vault",
                      "description": name,
                      "order_id": order.id,
                      "handler": function (response) {
                          // This is where you would call another backend endpoint to verify the payment
                          const verifyUrl = "/.netlify/functions/verify-payment";

                          fetch(verifyUrl, {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                  razorpay_order_id: response.razorpay_order_id,
                                  razorpay_payment_id: response.razorpay_payment_id,
                                  razorpay_signature: response.razorpay_signature,
                                  product_name: name,
                                  download_link: downloadLink, // Send the download link to the backend
                                  customer_email: customerEmail // Send the customer's email to the backend
                              }),
                          })
                          .then(res => res.json())
                          .then(data => {
                              if (data.success) {
                                  // Use a custom message box instead of alert()
                                  // since alerts are blocked by the iframe
                                  console.log("Payment verified. A link to your template has been sent to your email!");
                              } else {
                                  console.error("Payment verification failed. Please contact support.");
                              }
                          });
                      },
                      "prefill": {
                          "name": "Your Name",
                          "email": customerEmail // Now using the email from the modal
                      },
                      "oncancel": function() {
                          // Explicitly hide the modal and backdrop
                          const emailModalElement = document.getElementById('emailModal');
                          const emailModal = bootstrap.Modal.getInstance(emailModalElement);
                          if (emailModal) {
                              emailModal.hide();
                          }
                          const backdrop = document.querySelector('.modal-backdrop');
                          if (backdrop) {
                              backdrop.remove();
                          }
                      }
                  };
                  const rzp1 = new Razorpay(options);
                  rzp1.open();
              } else {
                  console.error("Failed to create order. Please try again later.");
              }
          })
          .catch(error => {
              console.error('An error occurred:', error);
          })
          .finally(() => {
              // Re-enable button and hide spinner regardless of outcome
              paymentBtn.disabled = false;
              paymentBtnText.classList.remove('d-none');
              paymentBtnSpinner.classList.add('d-none');
          });
      };

      // Initialize the modal if Bootstrap is available
      window.onload = function() {
          // This is a workaround to make the button work with the modal
          const rzpButton = document.getElementById('rzp-button');
          rzpButton.onclick = function() {
              const myModal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
              if (myModal) {
                  myModal.show();
              } else {
                  const newModal = new bootstrap.Modal(document.getElementById('emailModal'));
                  newModal.show();
              }
          };
      };
    </script>