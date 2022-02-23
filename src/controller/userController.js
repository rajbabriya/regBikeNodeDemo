const User = require("../models/user");

exports.createUser = async (req, res) => {
  const email = req.body.email;
  const foundedUser = await User.findOne({ email });

  if (foundedUser)
    return res.status(406).send({ message: "Email Already Exist!!" });

  const user = new User(req.body);

  try {
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password,
      res
    );

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
};
