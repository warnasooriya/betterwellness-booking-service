const express = require("express");
const Availability = require("../models/Availability");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const User = require("../models/User");
const verifyToken = require('../middleware/cognitoAuth');
router.use(verifyToken)
const moment = require("moment-timezone");
const { sendBookingConfirmationEmail } = require("../services/sendNotifications");
const fs = require("fs");
const path = require("path");
// Create a new event

router.post("/booking", async (req, res) => {


  const {availabilityId,user} = req.body;
  if (!availabilityId) {
    return res.status(400).json({ message: "Problem with availability" });
  }
  if(!user){
    return res.status(400).json({ message: "Problem with user session" });
  }

  const userInfo = await User.findOne({cognito_id: user});
  if (!userInfo) {
    return res.status(400).json({ message: "Problem with user session" });
  }


  // const session = await mongoose.startSession();
  let booked;
  try {
    // await session.withTransaction(async () => {
    const availability = await Availability.findOne({ _id: availabilityId });
    if (!availability) {
      return res.status(404).json({ message: "this slot is not found" });
    }

    if(availability.booked===true){
      return res.status(400).json({ message: "this slot is already booked" });
    }
    availability.booked = true;
    availability.bookedBy = userInfo._id;
    
    await availability.save();
    const booking = new Booking({
      availability: availabilityId,
      bookedBy: userInfo._id,
      counselor: availability.user,
      remarks: req.body.remarks,
    });
     
    booked = await booking.save();
   
    const availabilityDetails = await Availability.findOne({ _id: availabilityId });
    const counselorDetails = await User.findOne({ _id: availabilityDetails.user });
    const customerDetails = await User.findOne({ _id: userInfo._id });
    const counselorName = counselorDetails.given_name + " " + counselorDetails.family_name;
    const customerName = customerDetails.given_name + " " + customerDetails.family_name;
    const bookingNumber = booked.bookingNumber;

    const bookingDetails = {
      bookingNo: bookingNumber,
      start: moment(availabilityDetails.start).tz("Asia/Colombo").format("YYYY-MM-DD HH:mm"),
      customer: customerName,
      counselor:counselorName,
    };

    const templatePath = path.join(__dirname, "../templates", "booking-email-template.html");
    const emailHtml = await getProcessedTemplate(templatePath, bookingDetails);

    await sendBookingConfirmationEmail(userInfo.email, emailHtml);
    res.status(201).json({ message: "Booking created successfully" , status: true});
  }
  catch (err) {
    await session.endSession();
    res.status(500).json({ message: err.message });
  }
   
});

// router.post("/booking", async (req, res) => {


//   const {availabilityId,user} = req.body;
//   if (!availabilityId) {
//     return res.status(400).json({ message: "Problem with availability" });
//   }
//   if(!user){
//     return res.status(400).json({ message: "Problem with user session" });
//   }

//   const userInfo = await User.findOne({cognito_id: user});
//   if (!userInfo) {
//     return res.status(400).json({ message: "Problem with user session" });
//   }


//   const session = await mongoose.startSession();
//   let booked;
//   try {
//     await session.withTransaction(async () => {
//     const availability = await Availability.findOne({ _id: availabilityId });
//     if (!availability) {
//       return res.status(404).json({ message: "this slot is not found" });
//     }

//     if(availability.booked===true){
//       return res.status(400).json({ message: "this slot is already booked" });
//     }
//     availability.booked = true;
//     availability.bookedBy = userInfo._id;
    
//     await availability.save({ session: session });
//     const booking = new Booking({
//       availability: availabilityId,
//       bookedBy: userInfo._id,
//       counselor: availability.user,
//       remarks: req.body.remarks,
//     });
    
    
//     booked = await booking.save({ session: session });
   
//     });

//     await session.commitTransaction();
//     await session.endSession();
    
//     const availabilityDetails = await Availability.findOne({ _id: availabilityId });
//     const counselorDetails = await User.findOne({ _id: availabilityDetails.user });
//     const customerDetails = await User.findOne({ _id: userInfo._id });
//     const counselorName = counselorDetails.given_name + " " + counselorDetails.family_name;
//     const customerName = customerDetails.given_name + " " + customerDetails.family_name;
//     const bookingNumber = booked.bookingNumber;

//     const bookingDetails = {
//       bookingNo: bookingNumber,
//       start: moment(availabilityDetails.start).tz("Asia/Colombo").format("YYYY-MM-DD HH:mm"),
//       customer: customerName,
//       counselor:counselorName,
//     };

//     const templatePath = path.join(__dirname, "../templates", "booking-email-template.html");
//     const emailHtml = await getProcessedTemplate(templatePath, bookingDetails);

//     await sendBookingConfirmationEmail(userInfo.email, emailHtml);
//     res.status(201).json({ message: "Booking created successfully" , status: true});
//   }
//   catch (err) {
//     await session.endSession();
//     res.status(500).json({ message: err.message });
//   }
   
// });

function getProcessedTemplate(filePath, data) {
  return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, htmlContent) => {
          if (err) {
              reject(err);
          } else {
              // Replace placeholders with actual data
              Object.keys(data).forEach((key) => {
                  const regex = new RegExp(`{{${key}}}`, "g");
                  htmlContent = htmlContent.replace(regex, data[key]);
              });
              resolve(htmlContent);
          }
      });
  });
}

// Get all events
router.get("/booking/list", async (req, res) => {

  
  const search = req.headers.searchtext ;
  console.log("search",req.headers.searchtext);

  let searchObj = {};
  if (search) {
    searchObj = JSON.parse(search);
  }

  const searchConditions = [];

  if (searchObj.name && searchObj.name !== "") {
    searchConditions.push({ fullName: new RegExp(searchObj.name, "i") });
  }
  
  if (searchObj.specialization && searchObj.specialization !== "" && searchObj.specialization.value) {
    searchConditions.push({ "specialization":   searchObj.specialization.label });
  }


  try {

    const query =[
      {
        $match:{
          booked: {$ne: true}
        }
      },
      {
          $match:{
              start:{$gte: new Date()},
              }
      },
          {
           $lookup: {
             from: "users",
             localField: "user",
             foreignField: "_id",
             as: "user",
           },
         },
          {
           $unwind: "$user",
         },
         {
           $lookup: {
             from: "specializations",
             localField: "user.specialization",
             foreignField: "_id",
             as: "user.specialization",
           },
         },
         {
           $unwind: "$user.specialization",
         },



         {
          $sort: { 
            start: 1
           },
         },
       
         {
         $group: {
           _id: "$user._id", // Group by counsellorId
           firstName: { $first: "$user.family_name" },
           lastName: { $first: "$user.given_name" },
           fullName: {
            $first: {
              $concat: ["$user.family_name", " ", "$user.given_name"]
            }
          },
           specialization: { $first: "$user.specialization.Area" },
           description: { $first: "$user.description" },
           availabilities: {
             $push: {
               availabilityId: "$_id",
               title: "$title",
               start: "$start",
               end: "$end"
             }
           }
         }
       },
       {
         $project: {
           counsellorId: "$_id",
           _id: 0,
           firstName: 1,
           lastName: 1,
           fullName: 1,
           specialization: 1,
           availabilities: 1,
            description: 1
         }
       }
     
     
     ];
    
    if (searchConditions.length > 0) {
      query.push({ $match: { $and: searchConditions } });
    }
    
     const availability = await Availability.aggregate(query);

     console.log("availability",availability);

    res.status(200).json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

 

module.exports = router;
