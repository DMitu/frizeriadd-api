const router = require("express").Router();
const Booking = require("../models/booking.model");
const { Vonage } = require('@vonage/server-sdk')
const from = "Vonage APIs"
const to = "40729179755"
const text = 'A text message sent using the Vonage SMS API'
const vonage = new Vonage({
  apiKey: "b2f83dc4",
  apiSecret: "mNHMxMamMrG0rdaq"
})
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
  
};
async function sendSMS() {
  await vonage.sms.send({to, from, text})
      .then(resp => { console.log('Message sent successfully'); console.log(resp); })
      .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}


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
    
    sendSMS();
    

    
    res.json(savedBooking);
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
});

module.exports = router;
