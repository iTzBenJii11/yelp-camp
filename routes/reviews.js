////////////// Requiring Modules //////////////

// Express
const express = require("express");

// Router Configuration with Access to req.params
const router = express.Router({ mergeParams: true });

// Helper Function for Error Handling
const wrapAsync = require("../errors/WarpAsync");

// Global App Error
const AppError = require("../errors/AppError");

////////////// Database Related //////////////

// Joi Schema for Review Validation
const { reviewSchema } = require("../JoiSchema/validateReviews");

// Review Model
const Review = require("../models/reviews");

// Campground Model
const Campground = require("../models/campground");

// Middleware to Validate Reviews
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new AppError(msg, 400);
  } else {
    next();
  }
};

////////////// Create Review //////////////

// POST: Add New Review to Campground
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params; // Get Campground ID
    const campground = await Campground.findById(id); // Find Campground by ID

    const review = new Review(req.body.review); // Create New Review
    campground.reviews.push(review); // Add Review to Campground

    await review.save(); // Save Review to DB
    await campground.save(); // Save Updated Campground

    res.redirect(`/campgrounds/${campground._id}`); // Redirect to Campground Page
  })
);

////////////// Delete Review //////////////

// DELETE: Remove Review from Campground
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review from the campground's review array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review itself
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${id}`); // Redirect to Campground Page
  })
);

////////////// Export Router //////////////

module.exports = router;
