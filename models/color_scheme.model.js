const mongoose = require("mongoose");
const validate = require("./validate");

const colorSchemeSchema = new mongoose.Schema(
  {
    red: {
      type: Number,
      required: true,
      validate: [
        validate.validateColorValue,
        "Значення червоного кольору має бути в межах [0, 255]",
      ],
    },
    green: {
      type: Number,
      required: true,
      validate: [
        validate.validateColorValue,
        "Значення зеленого кольору має бути в межах [0, 255]",
      ],
    },
    blue: {
      type: Number,
      required: true,
      validate: [
        validate.validateColorValue,
        "Значення синього кольору має бути в межах [0, 255]",
      ],
    },
    label: {
      type: String,
      required: true,
      validate: [
        validate.validateNonZeroLength,
        "Мітка повинна мати довжину більше 0",
      ],
    },
    ordering: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ColorScheme", colorSchemeSchema);
