const mongoose = require("mongoose");

const biketypeSchema = new mongoose.Schema({
  bikeType: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const BikeTypes = mongoose.model("BikeTypes", biketypeSchema);

module.exports = BikeTypes;
