const mongoose = require("mongoose");

const SpecializationSchema = new mongoose.Schema(
  {
    Area: {
      type: String,
      required: true,
      unique: true,
    },
    Description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Specialization = mongoose.model("Specialization", SpecializationSchema);

module.exports = Specialization;
