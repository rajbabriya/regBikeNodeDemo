const express = require("express");
const router = express.Router();
const Bikes = require("../models/bike");
const BikeTypes = require("../models/biketype");
const auth = require("../middleware/auth");

router.get("/", (req, res) => {
  res.send("Bikes Route");
});

//Create Bike Type
router.post("/createBikeType", auth, async (req, res) => {
  const uid = req.user._id;
  const bikeType = new BikeTypes({ ...req.body, createdBy: uid });

  try {
    await bikeType.save();
    res.status(201).send(bikeType);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Get Bike Types
router.get("/bikeTypes", async (req, res) => {
  try {
    const bikeTypes = await BikeTypes.find({});
    if (!bikeTypes[0]) {
      return res.status(404).send({ error: "Not Found!" });
    }
    res.send(bikeTypes);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Create Bike
router.post("/createBike", auth, async (req, res) => {
  const uid = req.user._id;
  const bikeType = await BikeTypes.findOne({
    bikeType: req.body.bikeType,
  });

  if (!bikeType) {
    return res.status(404).send({ error: "Bike Type Not Avaliable!!" });
  }

  const bike = new Bikes({
    ...req.body,
    bikeType: bikeType._id,
    createdBy: uid,
  });

  try {
    await bike.save();
    res.status(201).send(bike);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Edit Bike
router.patch("/bike/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["bikeName", "price", "engine", "milage"];
  const isValidOperation = updates.every((update) =>
    allowedUpdate.includes(update)
  );
  if (!isValidOperation) {
    res.status(400).send({ error: "Invalid Updates!!" });
  }

  const uid = req.user._id;
  const bike = await Bikes.find({ _id: req.params.id });
  if (!bike[0]) return res.status(404).send({ error: "Bike Not Found" });

  if (uid.toString() === bike[0].createdBy.toString()) {
    try {
      const bike = await Bikes.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!bike) return res.status(404).send();
      res.send(bike);
    } catch (e) {
      res.status(500).send(e);
    }
  } else {
    res.status(406).send({
      error:
        "The Person Who Creates this Bike, Only this person can Modify Details of the Bike ",
    });
  }
});

//Delete Bike
router.delete("/bike/:id", auth, async (req, res) => {
  const uid = req.user._id;
  const bike = await Bikes.find({ _id: req.params.id });
  if (!bike[0]) return res.status(404).send({ error: "Bike Not Found" });

  if (uid.toString() === bike[0].createdBy.toString()) {
    try {
      const bike = await Bikes.findByIdAndDelete(req.params.id);
      if (!bike) return res.status(404).send();
      res.send(bike);
    } catch (e) {
      res.status(500).send(e);
    }
  } else {
    res.status(406).send({
      error:
        "The Person Who Creates this Bike, Only this person can Modify Details of the Bike ",
    });
  }
});

//Get All Bikes
router.get("/bikes", async (req, res) => {
  try {
    const bikes = await Bikes.find({});
    if (!bikes[0]) {
      return res.status(404).send({ error: "Not Found!" });
    }
    res.send(bikes);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Get Bike by it's Bike Type
router.get("/bikes/:bikeType", async (req, res) => {
  const bikeType = await BikeTypes.findOne({ bikeType: req.params.bikeType });
  if (!bikeType) return res.status(404).send({ error: "Bike Type Not Found" });

  try {
    const bikes = await Bikes.find({ bikeType: bikeType._id });
    if (!bikes[0]) {
      return res.status(404).send({ error: "Not Found!" });
    }
    res.send(bikes);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Get Recent Registered Bikes default it returns last 2 added bikes
//For display older bikes pass sortBy=creaatedAt:asec in query string
//For limit data pass limit=5 in query string
router.get("/recentBikes", async (req, res) => {
  let sort = { createdAt: -1 };
  let limit = 2;
  if (req.query.limit) {
    limit = req.query.limit;
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    const bikes = await Bikes.find({}).sort(sort).limit(limit);
    if (!bikes[0]) return res.status(404).send();
    res.send(bikes);
  } catch (e) {
    res.status(500).send(e);
  }
});

//like and dislike bike
router.post("/likebike/:id", auth, async (req, res) => {
  const uid = req.user._id;
  let likes = [];
  const bike = await Bikes.findById(req.params.id);

  if (!bike) {
    return res.status(404).send({ error: "Bike Not Avaliable of This ID!!" });
  }
  likes = bike.likes;
  if (likes.includes(uid)) {
    likes.remove(uid);
  } else {
    likes.push(uid);
  }

  try {
    const bike = await Bikes.findByIdAndUpdate(
      req.params.id,
      { likes },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!bike) return res.status(404).send();
    res.send(bike);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Get most liked bike
router.get("/mostliked", async (req, res) => {
  try {
    let max_likes = 0;
    let max_liked_bike = {};
    const bikes = await Bikes.find({});
    if (!bikes[0]) {
      return res.status(404).send({ error: "Not Found!" });
    }

    for (let i = 0; i < bikes.length; i++) {
      if (bikes[i].likes.length > max_likes) {
        max_likes = bikes[i].likes.length;
        max_liked_bike = bikes[i];
      }
    }
    res.send({ totalLikes: max_likes, max_liked_bike });
  } catch (e) {
    res.status(500).send(e);
  }
});

//Comment on bike
router.post("/comment/:bikeId", auth, async (req, res) => {
  const uid = req.user._id;

  const bike = await Bikes.findById(req.params.bikeId);

  if (!bike) {
    return res.status(404).send({ error: "Bike Not Avaliable of This ID!!" });
  }

  const comment = {
    ...req.body,
    userId: uid,
  };
  try {
    const bike = await Bikes.findByIdAndUpdate(
      req.params.bikeId,
      { $push: { comments: comment } },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!bike) return res.status(404).send();
    res.send(bike);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
