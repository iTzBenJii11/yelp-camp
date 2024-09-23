// Configure out Schema

const mongoose = require("mongoose");
const { title } = require("process");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  location: String,
  description: String,
  image: String,
});

const Campground = mongoose.model("Campground", CampgroundSchema);

module.exports = Campground;
