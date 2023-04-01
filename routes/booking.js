const router = require("express").Router();
const Booking = require("../models/booking.model");
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const cron = require('node-cron');

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
});

const sendReminder = async (bookingData) => {
  const { customerPhone, customerName, service, date, time } = bookingData;

  // Send SMS reminder to the customer
  await client.messages.create({
    to: customerPhone,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: `Salut, ${customerName}. Iti reamintesc de programarea ta pentru ${service} la ora ${time}.`,
  });
};

// Create a new booking
router.post("/add", async (req, res) => {
  const { customerName, customerPhone, service, date, time} = req.body;
  console.log("Request body:", req.body);

  const newBooking = new Booking({
    customerName,
    customerPhone,
    service,
    date,
    time
  });

  try {
    const savedBooking = await newBooking.save();
    

    // Send SMS notification to the customer
    await client.messages.create({
      to: customerPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `Programarea ta pentru ${service} in data de: ${date} la ora ${time} A fost creata cu succes. Ne vedem curand :)`,
    });

    // Send SMS notification to the owner
    await client.messages.create({
      to: process.env.OWNER_PHONE_NUMBER,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `PROGRAMARE NOUA! Nume: ${customerName} pentru ${service} in data de : ${date} la ora: ${time}.`,
    });

    // Schedule the reminder 2 hours before the booking
    const reminderDate = new Date(date);
    reminderDate.setHours(reminderDate.getHours() - 2);
    const reminderCronTime = `${reminderDate.getMinutes()} ${reminderDate.getHours()} ${reminderDate.getDate()} ${reminderDate.getMonth()+1} *`;

    cron.schedule(reminderCronTime, () => {
      console.log('Sending reminder:', { customerPhone, customerName, service, date, time });
      sendReminder({ customerPhone, customerName, service, date, time });
    });

    await sendReminder({ customerPhone, customerName, service, date, time });

    res.json(savedBooking);
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
});

module.exports = router;
