// Configure out Schema

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");

// Campground Schema
const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  location: String,
  description: String,
  image: String,

  // One-To-Many relationship, a campground can have many reviews but a reviews will be associated with one campground.
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Mongoose delete middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // Assuming 'reviews' is an array of review IDs in the campground document
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

const Campground = mongoose.model("Campground", CampgroundSchema);
module.exports = Campground;
