////////////// Requiring Modules //////////////

// Express
const express = require("express");

// Router Configuration
const router = express.Router({ mergeParams: true });

// Helper Function for Error Handling
const wrapAsync = require("../errors/WarpAsync");

// Global App Error
const AppError = require("../errors/AppError");

////////////// Database Related //////////////

// Joi Schema for Campground Validation
const { campgroundSchema } = require("../JoiSchema/validateCampground");

// Campground Model
const Campground = require("../models/campground");

// Middleware to Validate Campgrounds
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new AppError(msg, 400);
  } else {
    next();
  }
};

////////////// Display Campgrounds //////////////

// GET: Display All Campgrounds
router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    if (campgrounds.length === 0) {
      throw new AppError("No campgrounds found", 404);
    }
    res.render("campgrounds/index", { campgrounds });
  })
);

////////////// Create Campground //////////////

// GET: Form to Create New Campground
router.get("/create", (req, res) => {
  res.render("campgrounds/create");
});

// POST: Add New Campground to Database
router.post(
  "/",
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

////////////// Update Existing Campground //////////////

// GET: Form to Edit Campground
router.get(
  "/:id/edit",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/update", { campground });
  })
);

// PUT: Update Campground in Database
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

////////////// Delete Campground //////////////

// DELETE: Remove Campground from Database
router.delete(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

////////////// Display Campground by ID //////////////

// GET: Display Campground by ID with Reviews
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");

    if (!campground) {
      throw new AppError("Can't Locate Product!!!", 404);
    }

    // Test that we can access reviews
    console.log(`Testing reviews: ${campground.reviews}`);

    res.render("campgrounds/view", { campground });
  })
);

////////////// Export Router //////////////

module.exports = router;
