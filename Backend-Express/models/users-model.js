const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@(gmail\.com|yahoo\.com|northeastern\.edu)$/,
  },
  password: { type: String, required: true }, // going to change
  sets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Set",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
