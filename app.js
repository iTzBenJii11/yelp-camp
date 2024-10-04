////////////// Requiring //////////////

// Express
const express = require("express");
const app = express();

// Random Joke
const { randomJoke } = require("./randomJoke");

// EJS
app.set("view engine", "ejs");

// Path
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// EJS-MATE
const ejsEngine = require("ejs-mate");
app.engine("ejs", ejsEngine);

// Global app error
const AppError = require("./errors/AppError");

// Helper Function for error handling
const wrapAsync = require("./errors/WarpAsync");

// Import Joi Schema for Campground & Reviews
const { campgroundSchema } = require("./JoiSchema/validateCampground");
const { reviewSchema } = require("./JoiSchema/validateReviews");

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

////////////// DATABASE IMPLEMENTATION //////////////

// Mongoose / MongoDB
const mongoose = require("mongoose");

// Import Campground Schema to create new Campgrounds
const Campground = require("./models/campground");
const Review = require("./models/reviews");

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
app.get(
  "/campgrounds",
  wrapAsync(async (req, res, next) => {
    // Fetch all campgrounds from database
    const campgrounds = await Campground.find({});
    // Throw error if no campgrounds are found
    if (campgrounds.length === 0) {
      throw new AppError("No campgrounds found", 404);
    }
    // Render all campgrounds index page
    res.render("campgrounds/index", { campgrounds });
  })
);

////////////// CREATE CAMPGROUND AND ADD TO DATABASE //////////////

// GET: Create Campground
app.get("/campgrounds/create", (req, res) => {
  res.render("campgrounds/create");
});

// POST: Created Campground Added To DB
app.post(
  "/campgrounds",
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// POST: Create a review and add to campground

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  wrapAsync(async (req, res, next) => {
    // Get id
    const { id } = req.params;

    // Find campground by id
    const campground = await Campground.findById(id);

    // Saves the body of the review
    const review = new Review(req.body.review);

    // Add review to campground array
    campground.reviews.push(review);

    // Saves review and campground
    await review.save();
    await campground.save();

    // Redirect to the campground
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

////////////// UPDATE EXISTING CAMPGROUND //////////////

app.get(
  "/campgrounds/:id/edit",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/update", { campground });
  })
);

app.put(
  "/campgrounds/:id",
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

////////////// DELETE //////////////

// Delete campground by ID
app.delete(
  "/campgrounds/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

// Delete Review of a Campground
app.delete(
  "/campgrounds/:campgroundId/reviews/:reviewId",
  wrapAsync(async (req, res, next) => {
    const { campgroundId, reviewId } = req.params;
    await Review.findOneAndDelete({
      _id: reviewId,
    });
    res.redirect(`/campgrounds/${campgroundId}`);
  })
);

////////////// DISPLAY CAMPGROUNDS BY ID //////////////

// GET: Display Campgrounds by ID
app.get(
  "/campgrounds/:id",
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

////////////// ERROR HANDLING //////////////

// // Handles errors for pages/routes which are not valid
// app.all("*", (req, res, next) => {
//   next(new AppError("Page Not Found!", 404));
// });

// // Handles errors which we've not defined and response with a dad joke and error page.
// app.use(async (err, req, res, next) => {
//   try {
//     // Des the statusError and Message from error and provides a default error code and message
//     const { statusCode = 500, message = "Something went wrong" } = err;
//     // Joke for error pages

//     const jokeData = await randomJoke();
//     const joke = jokeData.joke; // Extract the joke from the API response
//     console.log(joke); // Test purpose

//     res.status(statusCode).render("error-page", { statusCode, message, joke });
//   } catch (e) {
//     console.error(e);
//     console.log("No dad joke available...");
//   }
// });

////////////// START EXPRESS SERVER //////////////

// Starting express
app.listen(3030, (req, res) => {
  console.log("CONNECTING TO SERVER");
});
