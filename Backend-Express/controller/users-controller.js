const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendError = require("../middlewear/error");

const User = require("../models/users-model");

const userSignup = (req, res) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(422).json({
          error: "User with this email already exists, use another email",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              sets: [],
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: "user made",
                  email: req.body.email,
                });
              })
              .catch((err) => {
                sendError(res, 500, err);
              });
          }
        });
      }
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const userLogin = (req, res) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(404).json({
              error: "Authentication failed",
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                // PARAMS RETURNED IN TOKEN USE TO PULL SETS, CAN BE MODIFIED
                email: user[0].email,
                sets: user[0].sets,
              },
              "notOurRealThing",
              {
                expiresIn: "2h",
              }
            );

            return res.status(200).json({
              message: "Login successful and updated",
              _id: user[0]._id,
              token: token,
            });
          } else {
            return res.status(404).json({
              error: "Authentication failed",
            });
          }
        });
      } else {
        return res.status(404).json({
          error: "Authentication failed",
        });
      }
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const addSetToUser = (req, res) => {
  const userId = req.params.userId;
  User.updateOne({ _id: userId }, { $push: { sets: req.body.set } })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Set added to user",
        request: {
          type: "GET",
          url: "http://localhost:3000/users/" + userID,
        },
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const deleteSetFromUser = (req, res) => {
  const userId = req.params.userId;
  User.updateOne({ _id: userId }, { $pull: { sets: req.body.set } })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Set deleted from user",
        request: {
          type: "GET",
          url: "http://localhost:3000/users/" + id,
        },
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const getSetFromUser = (req, res) => {
  const id = req.params.userId;
  User.findById(id)
    .select("sets")
    .populate("sets", "title cards")
    .exec()
    .then((doc) => {
      console.log("From Database (User sets):", doc);
      if (doc) {
        res.status(200).json({
          sets: doc,
        });
      } else {
        res.status(404).json({
          message: "User Not Found",
        });
      }
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

module.exports = {
  userSignup,
  userLogin,
  deleteUser,
  addSetToUser,
  deleteSetFromUser,
  getSetFromUser,
};
