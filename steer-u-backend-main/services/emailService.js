// services/emailService.js
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER; // steeryourhappiness@gmail.com
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ EMAIL ENV NOT SET (EMAIL_USER / EMAIL_PASS)");
}

/**
 * Gmail SMTP Transporter
 */
const transporter = nodemailer.createTransport({
  service: "gmail",              // ✅ BEST for Gmail
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,             // ✅ App Password
  },
});

/**
 * Verify SMTP on server start
 */
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP VERIFY ERROR:", error);
  } else {
    console.log("✅ GMAIL SMTP READY");
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
    from: `"Steer-U" <${EMAIL_USER}>`,
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
  const { pseudoName, date, slot, patientEmail, mobile } = bookingDetails;

  await transporter.sendMail({
    from: `"Steer-U" <${EMAIL_USER}>`,
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
 * ✅ Send feedback / support email to admin
 * User email goes in REPLY-TO
 */
const sendFeedbackEmail = async ({ issueType, message, contact, timestamp }) => {
  const info = await transporter.sendMail({
    from: `"Steer-U Support" <${EMAIL_USER}>`, // ✅ SYSTEM EMAIL
    to: EMAIL_USER,                            // ✅ ADMIN
    replyTo: contact,                          // ✅ USER
    subject: `New Support Request - ${issueType}`,
    html: `
      <h2>New Feedback / Support</h2>
      <p><b>User Contact:</b> ${contact}</p>
      <p><b>Issue Type:</b> ${issueType}</p>
      <p><b>Message:</b><br/>${message}</p>
      <p><b>Submitted At:</b> ${
        timestamp
          ? new Date(timestamp).toLocaleString()
          : new Date().toLocaleString()
      }</p>
    `,
  });

  console.log("✅ Feedback email sent:", info.response);
};

module.exports = {
  sendPatientConfirmation,
  sendDoctorNotification,
  sendFeedbackEmail,
};
