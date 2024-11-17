// Require Mongoose
const mongoose = require("mongoose");

// Create Schema
const Schema = mongoose.Schema;

// Require Passport
const passportLocalMongoose = require("passport-local-mongoose");

// Create as user schema
const UserSchema = new Schema({
  email: {
    type: String, // Data type
    required: true, // Is it required?
    unique: true, // Should it be unique?
  },
});

// Add a username, hash and salt field to store the username, the hashed password and the salt value.
UserSchema.plugin(passportLocalMongoose);

// Allow the user to create a "User" instance
module.exports = mongoose.model("User", UserSchema);
