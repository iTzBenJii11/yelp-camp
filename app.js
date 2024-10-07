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

// Import Campgrounds Routing
const campgrounds = require("./routes/campgrounds");

// Import Reviews Routing
const reviews = require("./routes/reviews");

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

// Server our Static Assets
app.use(express.static(path.join(__dirname, "public")));

////////////// DATABASE IMPLEMENTATION //////////////

// Mongoose / MongoDB
const mongoose = require("mongoose");

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

////////////// Routing //////////////

// GET: Home Page
app.get("/", (req, res) => {
  res.render("home");
});

// Campgrounds Router
app.use("/campgrounds", campgrounds);

// Review Router
app.use("/campgrounds/:id/reviews", reviews);

//////////// ERROR HANDLING //////////////

// Handles errors for pages/routes which are not valid
app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found!", 404));
});

// Handles errors which we've not defined and response with a dad joke and error page.
app.use(async (err, req, res, next) => {
  try {
    // Des the statusError and Message from error and provides a default error code and message
    const { statusCode = 500, message = "Something went wrong", stack } = err;
    // Joke for error pages

    const jokeData = await randomJoke();
    const joke = jokeData.title; // Extract the joke from the API response
    // Replace "Joke" with "Title"
    console.log(joke); // Test purpose

    res
      .status(statusCode)
      .render("error-page", { statusCode, message, joke, stack });
  } catch (e) {
    console.error(e);
    console.log("No dad joke available...");
  }
});

////////////// START EXPRESS SERVER //////////////

// Starting express
app.listen(3030, (req, res) => {
  console.log("CONNECTING TO SERVER");
});
