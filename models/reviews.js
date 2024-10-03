const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Review Schema
const ReviewSchema = new Schema({
  body: String,
  rating: Number,
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
