const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const sendError = require("../middlewear/error");

const Card = require("../models/cards-model");

const createCard = (req, res) => {
  const card = new Card({
    _id: new mongoose.Types.ObjectId(),
    term: req.body.term,
    definition: req.body.definition,
  });
  card
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Adding new card",
        createdCard: {
          term: result.term,
          definition: result.definition,
        },
        _id: result._id,
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const getCardById = (req, res) => {
  const id = req.params.cardId;
  Card.findById(id)
    .select("term definition")
    .exec()
    .then((result) => {
      if (result) {
        console.log("From database: ", result);
        res.status(200).json({
          card: result,
          request: {
            type: "GET",
            URL: "http://localhost:3000/cards/" + id,
          },
        });
      } else {
        res.status(404).json({
          message: "Card not found :(",
        });
      }
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const getCard = (req, res) => {
  Card.find()
    .exec()
    .then((docs) => {
      const response = {
        cards: docs.map((doc) => {
          return {
            id: doc._id,
            term: doc.term,
            defintiion: doc.definition,
            request: {
              type: "GET",
              URL: "http://localhost:3000/cards/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const deleteCard = (req, res, next) => {
  const id = req.params.cardId;
  Card.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Card Deleted Successfully",
        request: {
          type: "POST",
          URL: "http://localhost:3000/cards/",
          body: { term: "String", definition: "String" },
        },
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const updateCard = (req, res) => {
  const id = req.params.cardId;
  Card.findOneAndUpdate(
    { _id: id },
    { $set: { term: req.body.term, definition: req.body.definition } },
    { new: true }
  )
    .select("term definition")
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Card updated successfully",
        card: result,
        request: {
          type: "GET",
          URL: "localhost:3000/cards" + id,
        },
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

module.exports = { createCard, getCard, getCardById, deleteCard, updateCard };
