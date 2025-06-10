const router = require("express").Router();
let UserSchema = require("../models/user.model");
let ColorSchemeSchema = require("../models/color_scheme.model");
let DataSchema = require("../models/data.model");
let SettingsSchema = require("../models/settings.model");
const passport = require("passport");
const asyncHandler = require("express-async-handler");
let { log, Status } = require("./route_logger");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.VERIFICATION_EMAIL,
    pass: process.env.VERIFICATION_PASSWORD,
  },
});

function sanitizeData(user) {
  user.emailVerificationToken = "REDACTED";
  user.emailVerificationTokenDate = "REDACTED";

  return user;
}

/**
* GET
* Повертає всі дані користувача у форматі JSON для поточного зареєстрованого користувача
*/
router.route("/").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id);
    res.json(sanitizeData(user));
  })
);

/**
* GET
* Повертає всі дані користувача у форматі JSON для поточного зареєстрованого користувача
* з усіма заповненими змінними
*/
router.route("/full-data").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id)
      .populate("colorSchemes")
      .populate("data")
      .populate("settings");

    res.json(sanitizeData(user));
  })
);

/**
* PUT
* Оновлює ім'я та ім'я користувача поточного користувача
*
* Обов'язковий вміст тіла
* ім'я користувача - ім'я користувача
* ім'я - ім'я
*/
router.route("/").put(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let username = req.body.username;
    let name = req.body.name;

    let user = await UserSchema.findById(req.user._id);

    user.username = username;
    user.name = name;
    await user.save();

    log(res, Status.SUCCESS, "Користувача оновлено.");
  })
);

/**
* ВИДАЛИТИ
* Видалити обліковий запис поточного користувача
*/
router.route("/").delete(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id);
    req.logOut(function(err) {
  if (err) { 
    log(res, Status.ERROR, "Logout error: " + err.message);
    return;
  }});

    for (let colorSchemeID of user.colorSchemes) {
      await ColorSchemeSchema.findByIdAndDelete(colorSchemeID);
    }
    for (let dataID of user.data) {
      await DataSchema.findByIdAndDelete(dataID);
    }
    await SettingsSchema.findByIdAndDelete(user.settings);
    await user.deleteOne();

    log(res, Status.SUCCESS, "Користувача видалено.");
  })
);

/**
* POST
* Змінює адресу електронної пошти користувача
*/
router.route("/change-email/:email").post(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id);
    let newEmail = req.params.email;

    if (user.email !== newEmail) {
      let exists = await UserSchema.exists({ email: newEmail });
      if (exists) {
        log(
          res,
          Status.ERROR,
          "Адреса електронної пошти, пов’язана з іншим обліковим записом"
        );
        return;
      }
    } else if (user.emailVerified) {
      log(res, Status.ERROR, "Адреса електронної пошти вже підтверджена");
    }

    user.email = newEmail;
    user.emailVerified = false;
    user.emailVerificationToken = uuidv4();
    user.emailVerificationTokenDate = Date.now();
    await user.save();

    await sendVerificationEmail(
      user.email,
      user.username,
      user.emailVerificationToken
    );

    log(res, Status.SUCCESS, "Додано електронну адресу та надіслано електронний лист із підтвердженням.");
  })
);

/**
* POST
* Повторно надіслати електронний лист із підтвердженням
*/
router.route("/resend-verification-email").post(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id);

    if (user.email === undefined || user.email === "") {
      log(res, Status.ERROR, "Адресу електронної пошти не знайдено");
    } else if (user.emailVerified) {
      log(res, Status.ERROR, "Адреса електронної пошти вже підтверджена");
    }

    user.emailVerificationToken = uuidv4();
    user.emailVerificationTokenDate = Date.now();
    await user.save();

    await sendVerificationEmail(
      user.email,
      user.username,
      user.emailVerificationToken
    );

    log(res, Status.SUCCESS, "Надіслано електронний лист з підтвердженням.");
  })
);

let sendVerificationEmail = async (email, username, token) => {
  return transport.sendMail({
    from: "Pixel Mood",
    to: email,
    subject: "Pixel Mood Creator Email Verification",
    html:
      "Press <a href=localhost:3000/#/verify/" +
      username +
      "/" +
      token +
      ">here</a> within 24 hours to verify your email. Thank you!",
  });
};

/**
* ВИДАЛИТИ
* Видаляє поточну збережену адресу електронної пошти користувача
*/
router.route("/change-email/").delete(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id);

    user.email = "";
    user.emailVerified = false;
    user.emailVerificationToken = "";
    user.emailVerificationTokenDate = Date.now();
    await user.save();

    log(res, Status.SUCCESS, "Видалений електронний лист.");
  })
);

/**
* POST
* Перевіряє адресу електронної пошти за допомогою токена підтвердження, надісланого на електронну пошту з лімітом у 24 години
*/
router.route("/verify-email/:user/:token").post(
  asyncHandler(async (req, res) => {
    let user = await UserSchema.findOne({ username: req.params.user });

    if (user == null) {
      log(res, Status.ERROR, "Користувач не існує");
      return;
    }

    let token = req.params.token;

    if (user.emailVerified) {
      log(res, Status.ERROR, "Електронну пошту вже підтверджено");
      return;
    }

    if (user.emailVerificationToken == "" || user.email == "") {
      log(res, Status.ERROR, "Користувач не має електронної пошти, пов'язаної з його обліковим записом");
      return;
    }

    if (user.emailVerificationToken != token) {
      log(res, Status.ERROR, "Неправильний токен підтвердження електронної пошти");
      return;
    }

    let diffHours =
      (Date.now() - user.emailVerificationTokenDate) / (1000 * 60 * 60);
    if (diffHours >= 24.0) {
      log(
        res,
        Status.ERROR,
        "Термін дії токена підтвердження електронної пошти закінчився. Будь ласка, надішліть запит на нове підтвердження електронної пошти."
      );
      return;
    }

    user.emailVerified = true;
    user.emailVerificationToken = "";
    user.emailVerificationTokenDate = Date.now();
    await user.save();

    log(res, Status.SUCCESS, "Verified email.");
  })
);

/**
* POST
* Змінює пароль користувача
*
* Обов'язковий вміст тіла
* oldPassword - оригінальний пароль до зміни
* newPassword - новий пароль після зміни
*/
router.route("/change-password").post(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    user = await UserSchema.findById(req.user._id);

    await user.changePassword(oldPassword, newPassword);

    log(res, Status.SUCCESS, "Пароль оновлено.");
  })
);

/**
* POST
* Запитує скидання пароля для поточного користувача
*/
router.route("/request-reset/:user").post(
  asyncHandler(async (req, res) => {
    let user = await UserSchema.findOne({ username: req.params.user });

    if (user == null) {
      log(res, Status.ERROR, "Користувач не існує");
      return;
    }

    if (!user.emailVerified || user.email === undefined || user.email === "") {
      log(res, Status.ERROR, "Електронна адреса користувача не підтверджена або не існує!");
      return;
    }

    user.passwordResetToken = uuidv4();
    user.passwordResetDate = Date.now();
    await user.save();

    await sendPasswordResetEmail(
      user.email,
      user.username,
      user.passwordResetToken
    );

    log(res, Status.SUCCESS, "Надіслано скидання пароля.");
  })
);

let sendPasswordResetEmail = async (email, username, token) => {
  return transport.sendMail({
    from: "Pixel Mood",
    to: email,
    subject: "Pixel Mood Creator Password Reset",
    html:
      "Press <a href=localhost:3000/#/reset-password/" +
      username +
      "/" +
      token +
      ">here</a> within 24 hours to reset your password. Thank you!",
  });
};

/**
* POST
* Скидає пароль за допомогою токена для користувача
*
* Необхідний вміст тіла
* newPassword - новий пароль після зміни
*/
router.route("/reset-password/:user/:token").post(
  asyncHandler(async (req, res) => {
    let user = await UserSchema.findOne({ username: req.params.user });

    if (user == null) {
      log(res, Status.ERROR, "Користувач не існує");
      return;
    }

    let token = req.params.token;
    let newPassword = req.body.newPassword;

    if (user.passwordResetToken != token) {
      log(res, Status.ERROR, "Неправильний токен скидання пароля");
      return;
    }

    let diffHours = (Date.now() - user.passwordResetDate) / (1000 * 60 * 60);
    if (diffHours >= 24.0) {
      log(
        res,
        Status.ERROR,
        "Термін дії токена скидання пароля минув. Будь ласка, надішліть запит на нове скидання пароля.."
      );
      return;
    }

    user.passwordResetToken = "";
    user.passwordResetTokenDate = Date.now();
    await user.setPassword(newPassword);
    await user.save();

    log(res, Status.SUCCESS, "Пароль успішно змінено.");
  })
);

/**
* ВИДАЛИТИ
* Видаляє користувача, який наразі ввійшов у систему
*
* Вміст основного повідомлення не потрібен
*/
router.route("/").delete(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let id = req.user._id;

    req.logOut(function(err) {
  if (err) { 
    log(res, Status.ERROR, "Помилка виходу: " + err.message);
    return;
  }});

    let user = await UserSchema.findById(id);

    let deleteRequests = [];

    for (let colorSchemeID of user.colorSchemes) {
      deleteRequests.push(ColorSchemeSchema.findByIdAndDelete(colorSchemeID));
    }
    for (let dataID of user.data) {
      deleteRequests.push(DataSchema.findByIdAndDelete(dataID));
    }

    await Promise.all(deleteRequests);
    await UserSchema.findByIdAndDelete(id);

    log(res, Status.SUCCESS, "Користувача видалено.");
  })
);

/**
* POST
* Реєструє надані облікові дані в програмі
*
* Необхідний вміст тіла:
* ім'я користувача - ім'я користувача
* пароль - пароль
* ім'я - ім'я
*/
router.route("/register").post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;

  const newUser = {
    username: username,
    name: name,
    colorSchemes: [],
    data: [],
  };

  UserSchema.register(new UserSchema(newUser), password, (err) => {
    if (err) {
      log(res, Status.ERROR, err);
      return;
    }

    passport.authenticate("local")(req, res, function () {
      log(res, Status.SUCCESS, "Користувача успішно додано.");
    });
  });
});

/**
* GET
* Повертає, чи доступне вказане ім'я користувача
*/
router.route("/check-available/username/:username").get(
  asyncHandler(async (req, res) => {
    let exists = await UserSchema.exists({
      username: req.params.username,
    });

    res.json(!exists);
  })
);

/**
* GET
* Повертає, чи доступна вказана електронна адреса
*/
router.route("/check-available/email/:email").get(
  asyncHandler(async (req, res) => {
    if (req.params.email === "") {
      return true;
    }

    let exists = await UserSchema.exists({
      email: req.params.email,
    });

    res.json(!exists);
  })
);

module.exports = router;
