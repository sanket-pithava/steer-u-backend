// services/emailService.js
const emailjs = require('@emailjs/nodejs');

// EmailJS Configuration from environment variables
const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

// Template IDs (Optimized for Free Plan - 2 Templates)
const TEMPLATE_ID_BOOKING = process.env.EMAILJS_TEMPLATE_ID_BOOKING;
const TEMPLATE_ID_FEEDBACK = process.env.EMAILJS_TEMPLATE_ID_FEEDBACK;

// Initialize EmailJS
emailjs.init({
  publicKey: PUBLIC_KEY,
  privateKey: PRIVATE_KEY,
});

/**
 * Sends a confirmation email to the patient.
 */
const sendPatientConfirmation = async (
  patientEmail,
  hangoutLink,
  bookingDetails
) => {
  const { pseudoName, doctor, date, slot } = bookingDetails;

  const templateParams = {
    to_email: patientEmail,
    title: "Booking Confirmed!",
    message: `Hi ${pseudoName}, your therapy session booking with ${doctor} is confirmed.`,
    pseudoName,
    doctor,
    date,
    slot,
    hangoutLink,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_BOOKING, templateParams);
    console.log(`Patient confirmation email sent via EmailJS to: ${patientEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${patientEmail} via EmailJS:`, error);
    throw error;
  }
};

/**
 * Sends a notification email to the doctor.
 */
const sendDoctorNotification = async (
  doctorEmail,
  hangoutLink,
  bookingDetails
) => {
  const { pseudoName, doctor, date, slot, patientEmail, mobile } = bookingDetails;

  const templateParams = {
    to_email: doctorEmail,
    title: "New Booking Notification!",
    message: `A new session has been booked with you by ${pseudoName}.`,
    pseudoName,
    doctor,
    date,
    slot,
    patientEmail,
    mobile,
    hangoutLink,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_BOOKING, templateParams);
    console.log(`Doctor notification email sent via EmailJS to: ${doctorEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${doctorEmail} via EmailJS:`, error);
    throw error;
  }
};

const sendFeedbackNotification = async (feedbackDetails) => {
  const { issueType, message, contact, timestamp } = feedbackDetails;

  const templateParams = {
    to_email: 'Admin@steer-u.com',
    issueType,
    message,
    contact,
    timestamp: new Date(timestamp).toLocaleString(),
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_FEEDBACK, templateParams);
    console.log(`Feedback notification email sent via EmailJS to Admin@steer-u.com`);
  } catch (error) {
    console.error(`Error sending feedback email via EmailJS:`, error);
  }
};

module.exports = {
  sendPatientConfirmation,
  sendDoctorNotification,
  sendFeedbackNotification,
};
