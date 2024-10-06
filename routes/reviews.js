// Require Express
const express = require("express");

// Configures our router
const router = express.Router({ mergeParams: true }); // Access to req.params

// Helper Function for error handling
const wrapAsync = require("../errors/WarpAsync");

// Global app error
const AppError = require("../errors/AppError");

////////////// DATABASE RELATED //////////////

// Import Joi Schema for Reviews
const { reviewSchema } = require("../JoiSchema/validateReviews");

// Require Review model schema
const Review = require("../models/reviews");

// Import Campground Schema to create new Campgrounds
const Campground = require("../models/campground");

// Validate Reviews
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    // Map over the errors array
    const msg = error.details.map((el) => el.message).join(",");
    throw new AppError(msg, 400);
  } else {
    next();
  }
};

// POST: Create a review and add to campground
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res, next) => {
    // Get id
    const { id } = req.params;

    // Find campground by id
    const campground = await Campground.findById(id);
    console.log(campground);

    // Saves the body of the review
    const review = new Review(req.body.review);
    console.log(review);

    // Add review to campground array
    campground.reviews.push(review);

    // Saves review and campground
    await review.save();
    await campground.save();

    // Redirect to the campground
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

////////////// DELETE REVIEW BY ID //////////////

// Delete Review of a Campground
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    console.log(id);
    console.log(reviewId);

    // Deletes reviews from when campgrounds are deleted
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    // Deletes the review itself
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
