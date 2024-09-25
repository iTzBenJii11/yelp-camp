////////////// Requiring //////////////

// Express
const express = require("express");
const app = express();

// EJS
app.set("view engine", "ejs");

// Path
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// EJS-MATE
const ejsEngine = require("ejs-mate");
app.engine("ejs", ejsEngine);

// App Error
const AppError = require("./errors/AppError");

////////////// MIDDLEWARE //////////////
// Allow the use for parsing
app.use(express.urlencoded({ extended: true }));

// Allow the use of method override
const methodOverride = require("method-override");
app.use(methodOverride("_method")); // Tells all routes to use the middleware

// Morgan Middleware (logs information about the incoming request)
const morgan = require("morgan");
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

////////////// DATABASE IMPLEMENTATION //////////////

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

////////////// SECRET PAGE //////////////
const secretPage = (req, res, next) => {
  const { password } = req.query;
  if (password === "431212") {
    next();
  } else {
    res.send("YOU DON'T HAVE ACCESS TO THIS PAGE");
  }
};

app.get("/secret", secretPage, (req, res) => {
  res.send("HELLO AND WELCOME TO THIS SECRET PAGE");
});

////////////// Routing CRUD //////////////

// GET: Home Page
app.get("/", (req, res) => {
  res.render("home");
});

////////////// DISPLAYS CAMPGROUNDS //////////////

// GET: Display all Campgrounds
app.get("/campgrounds", async (req, res, next) => {
  try {
    // Fetch all campgrounds from database
    const campgrounds = await Campground.find({});
    // Throw error if no campgrounds are found
    if (campgrounds.length === 0) {
      throw new AppError("No campgrounds found", 404);
    }
    // Render all campgrounds index page
    res.render("campgrounds/index", { campgrounds });
  } catch (e) {
    // Pass any errors to the global error handler
    next(e);
  }
});

////////////// CREATE CAMPGROUND AND ADD TO DATABASE //////////////

// GET: Create Campground
app.get("/campgrounds/create", (req, res) => {
  res.render("campgrounds/create");
});

// POST: Created Campground Added To DB
app.post("/campgrounds", async (req, res, next) => {
  try {
    const newCampground = new Campground(req.body);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
  } catch (e) {
    next(e);
  }
});

////////////// UPDATE EXISTING CAMPGROUND //////////////

app.get("/campgrounds/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const campgroundType = await Campground.findById(id);
    res.render("campgrounds/update", { campgroundType });
  } catch (e) {
    next(e);
  }
});

app.put("/campgrounds/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const campgroundEdit = await Campground.findByIdAndUpdate(id, req.body);
    res.redirect(`${campgroundEdit._id}`);
  } catch (e) {
    next(e);
  }
});

////////////// DISPLAY CAMPGROUNDS BY ID //////////////

// GET: Display Campgrounds by ID
app.get("/campgrounds/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const campgroundType = await Campground.findById(id);
    if (!campgroundType) {
      throw new AppError("Can't Locate Product", 404);
    }
    res.render("campgrounds/view", { campgroundType });
  } catch (e) {
    next(e);
  }
});

////////////// DELETE CAMPGROUND BY ID //////////////
app.delete("/campgrounds/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  } catch (e) {
    next(e);
  }
});

////////////// BASIC ERROR HANDLING MIDDLEWARE //////////////
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});

////////////// START EXPRESS SERVER //////////////

// Starting express
app.listen(3030, (req, res) => {
  console.log("CONNECTING TO SERVER");
});
