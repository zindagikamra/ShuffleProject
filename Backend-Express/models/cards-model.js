const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  term: { type: String, required: true },
  definition: { type: String, required: true },
});

module.exports = mongoose.model("Card", cardSchema);
