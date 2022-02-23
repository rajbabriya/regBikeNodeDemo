const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const bikeRouter = require("./routers/bikes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(bikeRouter);

app.listen(port, () => {
  console.log("Server is start on port " + port);
});

const jwt = require("jsonwebtoken");