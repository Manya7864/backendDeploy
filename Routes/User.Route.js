const userModel = require("../Model/User.Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");

const userrouter = express.Router();

userrouter.post("/signup", async (req, res) => {
  const {email, password } = req.body;
 await bcrypt.hash(password, 6, async function (err, hash) {
    if (err) {
      return res.send("Signup fail");
    }
    const user = new userModel({
      email,
      password: hash,
    });
    await user.save();
    res.send("signup succesfully");
  });
});



userrouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.send("USER not found");
    }
    const hashpwd = user.password;
    bcrypt.compare(password, hashpwd, function (err, result) {
      if (err) {
        return res.send("try again");
      }
      if (result) {
        const token = jwt.sign(
          { email: user.email},
          process.env.JWT_KEY
        );
        return res.send({
          message: "login succesfull",
          token: token,
          
        });
      } else {
        res.send("invalid credential");
      }
    });
  });

  userrouter.post("/logout", async (req, res) => {
    const token =req.body.token
    const user = await userModel.findOne({ email });
    res.send({ email: user.email });
  });

  module.exports = userrouter;
