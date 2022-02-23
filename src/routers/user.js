const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controller/userController");

router.get("/", (req, res) => {
  res.send("User Route");
});

// //Create user
router.post("/users", userController.createUser);

//Login User
router.get("/users/login", userController.login);

//Logout User
router.post("/users/logout", auth, userController.logout);

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

module.exports = router;
