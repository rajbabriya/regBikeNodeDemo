const mongoose = require("mongoose");
const validator = require("validator");

const bikeSchema = new mongoose.Schema(
  {
    bikeType: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    bikeName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    engine: {
      type: String,
      required: true,
      trim: true,
    },
    milage: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    likes: {
      type: [mongoose.Types.ObjectId],
    },
    comments: {
      type: [
        {
          type: new mongoose.Schema(
            {
              userId: {
                type: mongoose.Types.ObjectId,
                ref: "User",
              },
              comment_text: {
                type: String,
              },
            },
            { timestamps: { updatedAt: false } }
          ),
        },
      ],
    },
  },

  {
    timestamps: true,
  }
);

const Bikes = mongoose.model("Bikes", bikeSchema);

module.exports = Bikes;
