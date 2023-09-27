const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const sendError = require("../middlewear/error");
const axios = require("axios");

const Set = require("../models/sets-model");

const createSet = (req, res) => {
  const set = new Set({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    cards: req.body.cards,
  });
  set
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Created set successfully",
        newSet: {
          _id: result._id,
          title: result.title,
          cards: result.cards,
        },
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const getSet = (req, res) => {
  Set.find()
    .select("id title cards")
    .populate("cards", "term definition")
    .exec()
    .then((docs) => {
      res.status(200).json({
        sets: docs,
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const getSetById = (req, res) => {
  const id = req.params.setId;
  Set.findById({ _id: id })
    .select("id title cards")
    .exec()
    .then((set) => {
      if (set) {
        res.status(200).json({
          set: set,
        });
      } else {
        res.status(404).json({
          error: "Set Not Found",
        });
      }
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const deleteSet = async (req, res) => {
  try {
    const id = req.params.setId;
    const set = await Set.findById(id).select("cards").exec();

    if (!set) {
      return res.status(404).json({ error: "Set Not Found" });
    }

    const deleteCardPromises = set.cards.map((cardId) =>
      axios.delete(`http://localhost:3000/cards/${cardId}`).catch((error) => {
        console.error(`Error in deleting card ${cardId} from set: ${error}`);
        throw error;
      })
    );

    await Promise.all(deleteCardPromises);

    const result = await Set.deleteOne({ _id: id }).exec();

    res.status(200).json({
      message: "Set deleted successfully",
      deletedItem: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

// const deleteSet = (req, res) => {
//   const headers = {
//     "Content-Type": "application/json",
//   };
//   const id = req.params.setId;
//   Set.findById({ _id: id })
//     .select("cards")
//     .exec()
//     .then((set) => {
//       if (set) {
//         //console.log(set)
//         const cardIds = set["cards"];
//         for (let i = 0; i < cardIds.length; i++) {
//           axios
//             .delete(
//               "http://localhost:3000/cards/" + cardIds[i].toString(),
//               "",
//               { headers }
//             )
//             .then(() => {
//               console.log("Card Deleted:" + cardIds[i].toString());
//             })
//             .catch((error) => {
//               res.status(404).json({
//                 error: "Card Not Found", //"Error in deleting card " + cardIds[i] + " from set"
//               });
//             });
//         }

//         Set.deleteOne({ _id: id })
//           .exec()
//           .then((result) => {
//             res.status(200).json({
//               message: "Set deleted successfully",
//               deletedItem: result,
//             });
//           })
//           .catch((err) => {
//             sendError(res, 500, err);
//           });
//       } else {
//         res.status(404).json({
//           error: "Set Not Found",
//         });
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };

const addCardsToSet = (req, res) => {
  const setId = req.params.setId;
  const cardIds = req.body.cards;
  Set.updateOne({ _id: setId }, { $push: { cards: { $each: cardIds } } })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Cards added to set",
        request: {
          type: "GET",
          url: "http://localhost:3000/sets/" + setId,
        },
      });
    })
    .catch((err) => {
      sendError(res, 500, err);
    });
};

const deleteCardsFromSet = async (req, res) => {
  const setId = req.params.setId;
  const cardIds = req.body.cards;
  try {
    // Remove the reference from the set
    const result = await Set.updateOne(
      { _id: setId },
      { $pullAll: { cards: cardIds } }
    ).exec();

    console.log(result);

    const deleteCardPromises = cardIds.map((cardId) =>
      axios
        .delete(`http://localhost:3000/cards/${cardId}`)
        .then(() => console.log(`Card Deleted: ${cardId}`))
        .catch((error) => {
          console.error(`Error in deleting card ${cardId} from set: ${error}`);
          throw error;
        })
    );

    await Promise.all(deleteCardPromises);

    res.status(200).json({
      message: "Cards deleted from set",
      request: {
        type: "GET",
        url: "http://localhost:3000/sets/" + setId,
      },
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, error);
  }
};

const createAISet = async (req, res) => {
  const cards = req.body.cards;
  const cleanedCardSet = cards.replaceAll(/\n/g, "").replaceAll(/\\"/g, '"');
  const jsonCards = JSON.parse(cleanedCardSet);
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const cardPromises = jsonCards.map((card) =>
      axios.post("http://localhost:3000/cards/", card, { headers })
    );
    const cardRespondes = await Promise.all(cardPromises);

    const cardIds = cardRespondes.map((card) => card.data._id);

    const set = new Set({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      cards: cardIds,
    });

    const result = await set.save();

    res.status(200).json({
      message: "Set created!",
      newSet: {
        _id: result._id,
        title: result.title,
        cards: result.cards,
      },
    });
  } catch (error) {
    sendError(res, 500, error);
  }
};

// const createAISet = (req, res) => {
//   const cardIds = [];
//   const cards = req.body.cards;
//   const cleanedCardSet = cards.replaceAll(/\n/g, "").replaceAll(/\\"/g, '"');
//   const jsonCards = JSON.parse(cleanedCardSet);
//   const headers = {
//     "Content-Type": "application/json",
//   };

//   const postPromises = [];
//   for (let i = 0; i < jsonCards.length; i++) {
//     postPromises.push(
//       axios
//         .post("http://localhost:3000/cards/", jsonCards[i], { headers })
//         .then((response) => {
//           const id = response["data"]["_id"];
//           cardIds.push(id);
//           console.log(cardIds);
//         })
//         .catch((error) => {
//           sendError(res, 500, error);
//         })
//     );
//   }

//   Promise.all(postPromises)
//     .then(() => {
//       const set = new Set({
//         _id: new mongoose.Types.ObjectId(),
//         title: req.body.title,
//         cards: cardIds,
//       });
//       set
//         .save()
//         .then((result) => {
//           console.log(result);
//           res.status(200).json({
//             message: "Created set successfully",
//             newSet: {
//               _id: result._id,
//               title: result.title,
//               cards: result.cards,
//             },
//           });
//         })
//         .catch((err) => {
//           sendError(res, 500, err);
//         });
//     })
//     .catch((error) => {
//       sendError(res, 500, error);
//     });
// };

module.exports = {
  createSet,
  getSet,
  getSetById,
  deleteSet,
  addCardsToSet,
  deleteCardsFromSet,
  createAISet,
};
