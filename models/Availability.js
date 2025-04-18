const { stat } = require("fs");
const mongoose = require("mongoose");

const AvailabilitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    booked: { type: Boolean, default: false },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true
        },
        status: { 
          type: String ,
          default: "Available"

        },  
  },

  { timestamps: true }
);

const Availability = mongoose.model("Availability", AvailabilitySchema);

module.exports = Availability;
