const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    availability: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "Availability",
         required: true
        },
    bookedBy: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true
        },
    counselor: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true
        },
    remarks: { type: String },
  },
  
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
