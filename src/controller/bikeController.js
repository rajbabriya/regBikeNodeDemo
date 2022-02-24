const Bikes = require("../models/bike");
const BikeTypes = require("../models/biketype");

exports.createBikeType = async (req, res) => {
  const uid = req.user._id;
  if (!req.body.bikeType) {
    return res.status(400).send({ message: "Field bikeType required!" });
  }
  const bikeType = new BikeTypes({ ...req.body, createdBy: uid });

  try {
    await bikeType.save();
    res.status(201).send(bikeType);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.getBikeTypes = async (req, res) => {
  try {
    const bikeTypes = await BikeTypes.find({});
    if (!bikeTypes[0]) {
      return res.status(404).send({ error: "Not Found!" });
    }
    res.send(bikeTypes);
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.createBike = async (req, res) => {
  const uid = req.user._id;
  if (!req.body.bikeType) {
    return res.status(400).send({ message: "Field bikeType required!" });
  }
  if (!req.body.bikeName) {
    return res.status(400).send({ message: "Field bikeName required!" });
  }
  if (!req.body.price) {
    return res.status(400).send({ message: "Field price required!" });
  }
  if (!req.body.engine) {
    return res.status(400).send({ message: "Field engine required!" });
  }
  if (!req.body.milage) {
    return res.status(400).send({ message: "Field milage required!" });
  }

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
};

exports.editBike = async (req, res) => {
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
};

exports.deleteBike = async (req, res) => {
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
};

exports.getAllBikes = async (req, res) => {
  try {
    const bikes = await Bikes.find({});
    if (!bikes[0]) {
      return res.status(404).send({ error: "Not Found!" });
    }
    res.send(bikes);
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.getBikesByBikeType = async (req, res) => {
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
};

exports.getRecentBikes = async (req, res) => {
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
    if (!bikes[0]) return res.status(404).send({ message: "Data Not Found!" });
    res.send(bikes);
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.like = async (req, res) => {
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
};

exports.mostlyLiked = async (req, res) => {
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
};

exports.comment = async (req, res) => {
  const uid = req.user._id;
  if (!req.body.comment_text) {
    return res.status(400).send({ message: "Field comment_text required!" });
  }
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
};
