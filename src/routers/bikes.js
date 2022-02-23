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

router.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Tasks.findById(req.params.id);
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }

  // Tasks.findById(req.params.id)
  //   .then((task) => {
  //     if (!task) return res.status(404).send();
  //     res.send(task);
  //   })
  //   .catch((err) => {
  //     res.status(500).send(err);
  //   });
});
router.patch("/tasks/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdate.includes(update)
  );
  if (!isValidOperation) {
    res.status(400).send({ error: "Invalid Updates!!" });
  }
  try {
    const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Tasks.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
