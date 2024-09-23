// Mongoose / MongoDB
const mongoose = require("mongoose");

// Import Schema
const Campground = require("../models/campground");

// Import cities
const cities = require("./cities");

// Import seed helper file

const { places, descriptors } = require("./seedhelper");

// Connect DB
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => console.log("Connected!"))
  .catch((e) => {
    console.error(e);
    console.log("AN ERROR HAS OCCURRED");
  });

// Function to take an array as an argument and generates a random element within the array
const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};


// Creates a random camp with location and title
const randomLocation = async () => {
  for (let i = 0; i < 50; i++) {
    // Generates a random number between 0 - 1000
    const randomNumber = Math.floor(Math.random() * 1000);

    // Creates our new campground
    const camp = new Campground({
      location: `${cities[randomNumber].city}, ${cities[randomNumber].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
    });

    // Saves the camps to the DB
    await camp.save();
    console.log(camp);
  }
};

// Deletes the entire DB and creates a new location
const seedDB = async () => {
  try {
    await Campground.deleteMany({});
    randomLocation();
  } catch (e) {
    console.log("DATABASE COULD NOT BE DELETED");
    console.error(e);
  }
};

// Execute seedDB and close the connection
seedDB();
