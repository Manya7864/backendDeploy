const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("./Config/db");
const userrouter = require("./Routes/User.Route")

require("dotenv").config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Home page");
  });
app.use("/user", userrouter);

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("database connected succesfully");
  } catch (err) {
    console.log("failed to connect to database", err);
  }
  console.log(`server running on ${process.env.PORT}`);
});
