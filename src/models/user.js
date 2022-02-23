const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error("Email is invalid!");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minLength: 6,
      validate(val) {
        //   if (val.toLowerCase() === "password") { //both are valid
        if (val.toLowerCase().includes("password")) {
          throw new Error("Password doesn't contain 'password'!");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "rAj", {
    expiresIn: "2 days",
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Email not found!!");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Password doesn't match!!");
  }

  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hashSync(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
