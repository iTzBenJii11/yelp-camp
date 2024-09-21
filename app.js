// Requiring

// Express
const express = require("express");
const app = express();

// EJS
app.set("view engine", "ejs");

// Path
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// MIDDLEWARE
// Allow the user for parsing
app.use(express.urlencoded({ extended: true }));

// Allow the user of method override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

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
app.get("/", (req, res) => {
  res.render("home");
});

////////////// DISPLAYS CAMPGROUNDS //////////////

// GET: Display Campgrounds
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds", { campgrounds });
});

////////////// CREATE CAMPGROUND AND ADD TO DATABASE //////////////

// GET: Create Campground
app.get("/campgrounds/create", (req, res) => {
  res.render("create");
});

// POST: Created Campground Added To DB
app.post("/campgrounds", async (req, res) => {
  const newCampground = new Campground(req.body);
  await newCampground.save();
  res.redirect("/campgrounds");
});

////////////// UPDATE EXISTING CAMPGROUND //////////////

app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params;
  const campgroundType = await Campground.findById(id);
  res.render("update", { campgroundType });
});

app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campgroundEdit = await Campground.findByIdAndUpdate(id, req.body);
  res.redirect(`${campgroundEdit._id}`);
});

////////////// DISPLAY CAMPGROUNDS BY ID //////////////

// GET: Display Campgrounds by ID
app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campgroundType = await Campground.findById(id);
  res.render("campground", { campgroundType });
});

////////////// DELETE CAMPGROUND BY ID //////////////
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

////////////// START EXPRESS SERVER //////////////

// Starting express
app.listen(3030, (req, res) => {
  console.log("CONNECTING TO SERVER");
});
