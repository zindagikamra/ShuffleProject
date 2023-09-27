const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// IMPORT ROUTES HERE
const cardRouter = require("./api/routes/cards-router");
const setRouter = require("./api/routes/sets-router");
const userRouter = require("./api/routes/users-router");
const flashcardRouter = require("./api/routes/flashcards-router");


mongoose.connect("mongo-connection-string-here", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accpet, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH");
    return res.status(200).json({});
  }
  next();
});

// app.use ROUTES HERE
app.use("/cards", cardRouter);
app.use("/sets", setRouter);
app.use("/users", userRouter);
app.use("/flashcards", flashcardRouter);



app.use((req, res, next) => {
  const error = new Error("URI Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
