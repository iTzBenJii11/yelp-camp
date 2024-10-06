// Require Express
const express = require("express");

// Configures our router
const router = express.Router({ mergeParams: true });

// Helper Function for error handling
const wrapAsync = require("../errors/WarpAsync");

// Global app error
const AppError = require("../errors/AppError");

////////////// DATABASE RELATED //////////////

// Import Joi Schema for Campground
const { campgroundSchema } = require("../JoiSchema/validateCampground");

// Import Campground Schema to create new Campgrounds
const Campground = require("../models/campground");

// Validate Campgrounds
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    // Map over the errors array
    const msg = error.details.map((el) => el.message).join(",");
    throw new AppError(msg, 400);
  } else {
    next();
  }
};

////////////// DISPLAYS CAMPGROUNDS //////////////

// GET: Display all Campgrounds
router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    // Fetch all campgrounds from database
    const campgrounds = await Campground.find({});
    // Throw error if no campgrounds are found
    if (campgrounds.length === 0) {
      throw new routerError("No campgrounds found", 404);
    }
    // Render all campgrounds index page
    res.render("campgrounds/index", { campgrounds });
  })
);

////////////// CREATE CAMPGROUND AND ADD TO DATABASE //////////////

// GET: Create Campground
router.get("/create", (req, res) => {
  res.render("campgrounds/create");
});

// POST: Created Campground Added To DB
router.post(
  "/",
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

////////////// UPDATE EXISTING CAMPGROUND //////////////

router.get(
  "/:id/edit",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/update", { campground });
  })
);

router.put(
  "/:id",
  validateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
      id,
      req.body.campground
    );
    res.redirect(`${campground._id}`);
  })
);

////////////// DELETE CAMPGROUND BY ID //////////////

// Delete campground by ID
router.delete(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

////////////// DISPLAY CAMPGROUNDS BY ID //////////////

// GET: Display Campgrounds by ID
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    // Find the campground by ID and then populates with the reviews.
    const campground = await Campground.findById(id).populate("reviews");

    // Checks to see if we can locate a campground
    if (!campground) {
      throw new AppError("Can't Locate Product!!!", 404);
    }

    // Test that we can access reviews
    console.log(`Testing reviews: ${campground.reviews}`); // Accessing populated reviews directly

    res.render("campgrounds/view", { campground });
  })
);

module.exports = router;
