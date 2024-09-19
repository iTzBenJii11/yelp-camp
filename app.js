// Requiring

// Express
const express = require("express");
const app = express();

// EJS
app.set("view engine", "ejs");

// Path
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

// Middleware

// Routing
app.get("", (req, res) => {
  res.send("working");
});

// Starting express
app.listen(3000, (req, res) => {
  console.log("CONNECTING TO SERVER");
});
