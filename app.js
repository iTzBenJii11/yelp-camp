// Requiring

// Express
const express = require("express");
const app = express();

// EJS
app.set("view engine", "ejs");

// Path
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// Mongoose / MongoDB
const mongoose = require("mongoose");

// Import Schema
const Campground = require("./models/campground");

// Connect DB
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => console.log("Connected!"))
  .catch((e) => {
    console.error(e);
    console.log("AN ERROR HAS OCCURRED");
  });

// Routing CRUD

// GET: Home Page
app.get("/makecampground", async (req, res) => {
  const camp = new Campground({ title: "ben", price: "3.99" });
  await camp.save();

  res.render("home", { camp });

  console.log(camp);
});

// Starting express
app.listen(3000, (req, res) => {
  console.log("CONNECTING TO SERVER");
});
