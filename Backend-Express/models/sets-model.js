const mongoose = require("mongoose");

const setSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
  ],
});

module.exports = mongoose.model("Set", setSchema);
