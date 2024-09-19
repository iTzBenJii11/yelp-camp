// Configure out Schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CampgroundSchema= new Schema({
    title: String,
    price: String,
    location: String,
    description: String
})

const Campground = mongoose.model('Campground', CampgroundSchema)

module.exports = Campground;