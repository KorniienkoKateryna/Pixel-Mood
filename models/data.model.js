const mongoose = require("mongoose");
const validate = require("./validate");

const dataSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    values: {
      type: [Number],
      required: true,
      validate: [validate.validateDataLength, "Розмір значень неправильний!"],
    },
    comments: {
      type: [String],
      required: true,
      validate: [
        validate.validateDataLength,
        "Розмір коментарів неправильний!",
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Data", dataSchema);
