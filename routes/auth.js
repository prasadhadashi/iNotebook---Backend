const express = require("express");
const User = require("../models/User"); //import model from model folder
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs"); //import bcrypt for password hashing
const jwt = require("jsonwebtoken"); // import jsonwebtoken for token generation
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRETE = "abcd";

//ROUTE 1 : Create a User using : POST "/api/auth/createuser" No login Required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Enter a valid Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // If the are errors, return bad request and the errors
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    // Check whether the user with same email already exists
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //Create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtokan = jwt.sign(data, JWT_SECRETE);

      // res.json({user})
      res.json({ authtokan });
      // catch the error if any in above code
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 2 : Authenticate a User using : POST "/api/auth/login" No login Required
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password is Requried").exists(),
  ],
  async (req, res) => {
    // If the are errors, return bad request and the errors
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          error: "please try to login with correct email and password",
        });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({
          error: "please try to login with correct email and password",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const JWT_SECRETE = "abcd";
      const authtokan = jwt.sign(data, JWT_SECRETE);
      res.json({ authtokan });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 3 : Get loggedin User Details : POST "/api/auth/getuser". login Required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
