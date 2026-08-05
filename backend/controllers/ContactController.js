// const Contact = require("../models/ContactModel");

// exports.createContact = async (req, res) => {
//   try {
//     const newContact = new Contact(req.body);
//     await newContact.save();

//     res.status(201).json({ message: "Form submitted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const Contact = require("../models/ContactModel");
const { sendEmail } = require("../services/email/sendEmail");

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, website, location, message } = req.body;

    // Input validation and sanitization
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().substring(0, 100), // Limit length
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim().substring(0, 20) : '',
      website: website ? website.trim().substring(0, 200) : '',
      location: location ? location.trim().substring(0, 100) : '',
      message: message.trim().substring(0, 1000), // Limit message length
    };

    // Save to DB
    const newContact = new Contact(sanitizedData);
    await newContact.save();

    await sendEmail({
      to: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      html: `
        <h2>New Client Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Website:</b> ${website}</p>
        <p><b>Location:</b> ${location}</p>
        <p><b>Message:</b> ${message}</p>
      `,
      retries: 2,
    });

    res.status(200).json({
      success: true,
      message: "Form submitted & email sent successfully "
    });

  } catch (error) {
    console.error("ERROR:", error); //  important debug
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};
