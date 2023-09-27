const getData = require("../../services/flashCardGenerator");
const sendError = require("../middlewear/error");
const axios = require("axios");

const createFlashcards = async (req, res) => {
  // add auth token JWT requirement
  try {
    const flashcards = await getData(
      req.body.type,
      req.body.prompt,
      req.body.quantity
    );
    //console.log(flashcards);
    // NEED TO MAKE SURE STUFF HERE HAPPENS AFTER DATA RETURNED
    const data = {
      title: req.body.title,
      cards: flashcards,
    };
    const headers = {
      "Content-Type": "application/json",
      // need to add auth token header
    };

    axios
      .post("http://localhost:3000/sets/AI", data, { headers })
      .then((response) => {
        console.log(response["data"]);
        res.status(200).json({
          message: "Flashcards created!",
          setData: response["data"],
        });
      })
      .catch((error) => {
        console.log(error);
        sendError(res, 500, error);
      });
  } catch (err) {
    console.error(err);
    sendError(res, 500, err);
  }
};

module.exports = { createFlashcards };
