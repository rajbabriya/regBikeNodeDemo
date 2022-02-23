const mongoose = require("mongoose");
const validator = require("validator");

mongoose
  .connect("mongodb://127.0.0.1:27017/RegisterBike", {
    useNewUrlParser: true,
    // useCreateIndex: true,
  })
  .then(() => console.log("Database Connected!!"));
