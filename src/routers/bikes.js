const express = require("express");
const router = express.Router();
const Bikes = require("../models/bike");
const BikeTypes = require("../models/biketype");
const auth = require("../middleware/auth");
const bikeController = require("../controller/bikeController");

router.get("/", (req, res) => {
  res.send("Bikes Route");
});

//Create Bike Type
router.post("/createBikeType", auth, bikeController.createBikeType);

//Get Bike Types
router.get("/bikeTypes", bikeController.getBikeTypes);

//Create Bike
router.post("/createBike", auth, bikeController.createBike);

//Edit Bike
router.patch("/bike/:id", auth, bikeController.editBike);

//Delete Bike
router.delete("/bike/:id", auth, bikeController.deleteBike);

//Get All Bikes
router.get("/bikes", bikeController.getAllBikes);

//Get Bikes by it's Bike Type
router.get("/bikes/:bikeType", bikeController.getBikesByBikeType);

//Get Recent Registered Bikes default it returns last 2 added bikes
//For display older bikes pass sortBy=creaatedAt:asec in query string
//For limit data pass limit=5 in query string
router.get("/recentBikes", bikeController.getRecentBikes);

//like and dislike bike
router.post("/likebike/:id", auth, bikeController.like);

//Get most liked bike
router.get("/mostliked", bikeController.mostlyLiked);

//Comment on bike
router.post("/comment/:bikeId", auth, bikeController.comment);

module.exports = router;
