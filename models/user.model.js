const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const validate = require("./validate");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      validate: [
        validate.validateUsernameLength,
        "Ім'я користувача має містити 0 < length <= 20",
      ],
    },
    password: {
      type: String,
      validate: [
        validate.validateNonZeroLength,
        "Пароль повинен мати довжину > 0",
      ],
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      validate: [validate.validateEmail, "Недійсна адреса електронної пошти"],
    },
    emailVerificationToken: {
      type: String,
      required: false,
      unique: false,
    },
    emailVerificationTokenDate: {
      type: Date,
      required: false,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    passwordResetToken: {
      type: String,
      required: false,
      unique: false,
    },
    passwordResetTokenDate: {
      type: Date,
      required: false,
    },
    colorSchemes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ColorScheme",
        },
      ],
      required: true,
    },
    data: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Data",
        },
      ],
      required: true,
    },
    settings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Settings",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
