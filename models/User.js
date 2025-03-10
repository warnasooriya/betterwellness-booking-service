const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
    },
    family_name: {
      type: String,
     
    },
    given_name: {
      type: String,
      required: true,
    },
    cognito_id: {
      type: String,
      required: true,
    },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization'
    },
    description: {
      type: String,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
