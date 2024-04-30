const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/myapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    phonenumber: { type: String, unique: true },
  })
);

const Vendor = mongoose.model(
  "Vendor",
  new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    phonenumber: { type: String, unique: true },
  })
);

app.post("/signup", async (req, res) => {
  const { fullname, email, password, confirm_password, mobile, role } =
    req.body;

  if (password !== confirm_password) {
    return res.status(400).send("Passwords do not match");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if (role === "customer") {
      const newCustomer = await Customer.create({
        fullname,
        email,
        password: hashedPassword,
        phonenumber: mobile,
      });
      res.status(201).json(newCustomer);
    } else if (role === "vendor") {
      const newVendor = await Vendor.create({
        fullname,
        email,
        password: hashedPassword,
        phonenumber: mobile,
      });
      res.status(201).json(newVendor);
    } else {
      return res.status(400).send("Invalid role");
    }
  } catch (error) {
    if (error.code === 11000 && error.keyValue && error.keyValue.phonenumber) {
      return res.status(400).send("Phone number is already registered");
    }
    res.status(500).send("Sign up failed");
  }
});

app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  console.log(role);

  try {
    let user;
    
    if (role === "customer") {
      user = await Customer.findOne({ email });
    } else if (role === "vendor") {
        console.log("vender");
      user = await Vendor.findOne({ email });
    } else {
      return res.status(400).send("Invalid role");
    }

    if (!user) {
      return res.status(404).send("User not found");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send("Invalid password");
    }

    // You may want to create and send a token for authentication here

    res.status(200).send("Login successful");
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed");
  }
});

app.get("/", (req, res) => {
  res.send("Server");
});
// Add login routes for customer and vendor authentication

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
