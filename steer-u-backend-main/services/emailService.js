// services/emailService.js
const nodemailer = require("nodemailer");

/**
 * ENV REQUIRED
 * EMAIL_USER = yourgmail@gmail.com
 * EMAIL_PASS = 16 digit Gmail App Password (no spaces)
 */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // IMPORTANT for VPS / Render
  },
});

// verify transporter on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP Verify Failed:", err);
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

/**
 * Send booking confirmation email to patient
 */
const sendPatientConfirmation = async (
  patientEmail,
  hangoutLink,
  bookingDetails
) => {
  const { pseudoName, doctor, date, slot } = bookingDetails;

  await transporter.sendMail({
    from: `"Steer-U" <${process.env.EMAIL_USER}>`,
    to: patientEmail,
    subject: `Booking Confirmed: ${doctor} on ${date}`,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Hi <b>${pseudoName}</b>,</p>
      <p>Your therapy session with <b>${doctor}</b> is confirmed.</p>

      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${slot}</p>

      <p><b>Google Meet Link:</b></p>
      <a href="${hangoutLink}">${hangoutLink}</a>

      <br/><br/>
      <p>🌐 <a href="https://steer-u.com">steer-u.com</a></p>
      <p><b>Steer Your Happiness!</b></p>
    `,
  });

  console.log(`✅ Patient email sent → ${patientEmail}`);
};

/**
 * Send booking notification email to doctor
 */
const sendDoctorNotification = async (
  doctorEmail,
  hangoutLink,
  bookingDetails
) => {
  const { pseudoName, doctor, date, slot, patientEmail, mobile } =
    bookingDetails;

  await transporter.sendMail({
    from: `"Steer-U" <${process.env.EMAIL_USER}>`,
    to: doctorEmail,
    subject: `New Booking: ${date} (${slot})`,
    html: `
      <h2>New Booking Notification</h2>

      <p><b>Patient Name:</b> ${pseudoName}</p>
      <p><b>Patient Email:</b> ${patientEmail}</p>
      <p><b>Mobile:</b> ${mobile || "N/A"}</p>

      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${slot}</p>

      <p><b>Google Meet Link:</b></p>
      <a href="${hangoutLink}">${hangoutLink}</a>

      <br/><br/>
      <p>— Steer-U Team</p>
    `,
  });

  console.log(`✅ Doctor email sent → ${doctorEmail}`);
};

/**
 * Send feedback / support email to admin
 */
const sendFeedbackEmail = async ({
  issueType,
  message,
  contact,
  timestamp,
}) => {
  await transporter.sendMail({
    from: `"Steer-U Feedback" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // admin mail
    subject: `New Feedback / Support - ${issueType}`,
    html: `
      <h2>New Feedback / Support Request</h2>

      <p><b>Issue Type:</b> ${issueType}</p>
      <p><b>Contact:</b> ${contact}</p>
      <p><b>Message:</b><br/>${message}</p>
      <p><b>Submitted At:</b> ${
        timestamp
          ? new Date(timestamp).toLocaleString()
          : new Date().toLocaleString()
      }</p>
    `,
  });

  console.log("✅ Feedback email sent to admin");
};

module.exports = {
  sendPatientConfirmation,
  sendDoctorNotification,
  sendFeedbackEmail,
};
