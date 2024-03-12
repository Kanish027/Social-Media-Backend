import nodemailer from "nodemailer"; // Library for sending emails

// Function to send an email using nodemailer
const sendEmail = async (options) => {
  // Creating a transporter with the SMTP configuration
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io", // Hostname of the SMTP server
    port: 2525, // Port number of the SMTP server
    auth: {
      user: "b366e65d637e5b", // User for authentication
      pass: "ed722b9b3dfc01", // Password for authentication
    },
  });

  // Constructing email options
  const mailOptions = {
    from: "", // Sender email address (can be left empty)
    to: options.email, // Recipient email address
    subject: options.subject, // Subject of the email
    text: options.message, // Text content of the email
  };

  // Sending the email using the transporter
  await transporter.sendMail(mailOptions);
};

export default sendEmail; // Exporting the sendEmail function
