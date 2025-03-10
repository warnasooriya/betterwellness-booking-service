const express = require("express");
const Availability = require("../models/Availability");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const User = require("../models/User");

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


  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
    const availability = await Availability.findOne({ _id: availabilityId });
    if (!availability) {
      return res.status(404).json({ message: "this slot is not found" });
    }

    if(availability.booked===true){
      return res.status(400).json({ message: "this slot is already booked" });
    }
    availability.booked = true;
    availability.bookedBy = userInfo._id;
    
    await availability.save({ session: session });
    const booking = new Booking({
      availability: availabilityId,
      bookedBy: userInfo._id,
      counselor: availability.user,
      remarks: req.body.remarks,
    });
    await booking.save({ session: session });


    });

    await session.commitTransaction();
    await session.endSession();

    res.status(201).json({ message: "Booking created successfully" , status: true});
  }
  catch (err) {
    await session.endSession();
    res.status(500).json({ message: err.message });
  }
   
});

// Get all events
router.get("/booking/list", async (req, res) => {
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
           specialization: 1,
           availabilities: 1,
            description: 1
         }
       }
     
     
     ];
    const availability = await Availability.aggregate(query);
    res.status(200).json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

 

module.exports = router;
