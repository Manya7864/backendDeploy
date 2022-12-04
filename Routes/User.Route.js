const userModel = require("../Model/User.Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");

const userrouter = express.Router();

userrouter.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  await bcrypt.hash(password, 6, async function (err, hash) {
    if (err) {
      return res.send("Signup fail");
    }
    const user = new userModel({
      email,
      password: hash,
      count: 0,
      loginDate: new Date(),
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
  let currentDate = new Date();
  console.log("TIME VLIDATE", Date.parse(currentDate),Date.parse(user.loginDate));

  const hashpwd = user.password;

  if (user.count < 5) {
    bcrypt.compare(password, hashpwd, async function (err, result) {
      if (err) {
        return res.send("try again");
      }

      if (result) {
        let newLoginData = {
          email: email,
          password: hashpwd,
          count: 0,
          loginDate: new Date(),
        };

        let newData = await userModel.findOneAndUpdate(
          { email: email },
          newLoginData,
          { new: true }
        );

        const token = jwt.sign({ email: user.email }, process.env.JWT_KEY);

        return res.send({
          message: "login succesfull",
          token: token,
          userEmail: user.email,
          result: newData,
        });
      } 
      else 
      {
        let newCount = user.count + 1;
        let limitDate = new Date(new Date().getTime() + 60*60*24*1000);
        console.log("COunt ", newCount);
        let newLoginData = {
          email: email,
          password: result.password,
          count: newCount,
          loginDate: limitDate,
        };
        let newData = await userModel.findOneAndUpdate(
          { email: email },
          newLoginData,
          { new: true }
        );
        res.send({ message: "invalid credential", result: newData });
      }
    });
  } 
  else 
  {
    let currentDate = new Date();
    if (Date.parse(currentDate)>= Date.parse(user.loginDate)) {
      console.log("TIMER STOP 60SEC Completed");
      bcrypt.compare(password, hashpwd, async function (err, result) {
        if (err) {
          return res.send("try again");
        }

        console.log(result)

        if (result) {
          let newLoginData = {
            email: email,
            password: hashpwd,
            count: 0,
            loginDate: new Date(),
          };

          let newData = await userModel.findOneAndUpdate(
            { email: email },
            newLoginData,
            { new: true }
          );
          const token = jwt.sign({ email: user.email }, process.env.JWT_KEY);

          res.send({
            message: "login succesfull",
            token: token,
            userEmail: user.email,
            result: newData,
          });
        }
        else{
          res.send("Invalid Credential")
        }
      });
    }else{
    res.send({ message: "Limit reached", user: user });
    }
  }
});

userrouter.post("/logout", async (req, res) => {
  const token = req.body.token;
  const user = await userModel.findOne({ email });
  res.send({ email: user.email });
});

module.exports = userrouter;
