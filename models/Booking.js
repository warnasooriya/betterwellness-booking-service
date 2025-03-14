const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const BookingSchema = new mongoose.Schema(
  {

    bookingNumber: { 
      type: Number ,
      unique: true
    },
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
BookingSchema.plugin(AutoIncrement, {
  inc_field: "bookingNumber",
  id: "booking_seq",
  start_seq: 1,
});

// **Pre-save Hook to Generate Unique `bookingNo` Per `TenantId`**
BookingSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const lastBookingNo = await mongoose
      .model("Booking")
      .findOne()
      .sort({ bookingNumber: -1 }) // Find the highest bookingNo  
      .select("bookingNumber");
    if (!lastBookingNo) {
      this.bookingNumber = 1;
    } else if (lastBookingNo.bookingNumber) {
      this.bookingNumber = lastBookingNo.bookingNumber + 1;
    } else {
      this.bookingNumber = 1;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
