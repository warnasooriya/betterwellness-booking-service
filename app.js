const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const corsOptions = require('./config/corsOptions')
const app = express();
const port = process.env.PORT || 5002;

// Middleware

app.use(cors(corsOptions))
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("Error connecting to MongoDB", err));

// Routes
const bookingRouter = require("./routes/bookingRouter");

app.use("/api", bookingRouter);


// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
