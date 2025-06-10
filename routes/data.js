const router = require("express").Router();
let UserSchema = require("../models/user.model");
let DataSchema = require("../models/data.model");
const asyncHandler = require("express-async-handler");
let { log, Status } = require("./route_logger");

/**
* GET
* Повертає масив об'єктів JSON з усіма даними про кольори/коментарі для поточного користувача, який увійшов у систему
*
* Необхідний вміст тіла:
* includeData - чи включати повну колірну схему та параметри даних
*/
router.route("/").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id).populate("data");

    if (!req.body.includeData) {
      for (let i in user.data) {
        user.data[i].values = null;
        user.data[i].comments = null;
      }
    }

    res.json(user.data);
  })
);
/** * GET * Повертає JSON-об'єкт з усіма даними про кольори/коментарі за певний рік для поточного користувача, який увійшов у систему */

router.route("/:year").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        res.json(data);
        return;
      }
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

/**
* POST
* Додає новий рік для користувача, який зараз увійшов у систему
*/
router.route("/:year").post(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);

    let user = await UserSchema.findById(req.user._id).populate("data");

    for (let data of user.data) {
      if (data.year == year) {
        log(res, Status.ERROR, "Дані за цей рік вже існують.");
        break;
      }
    }

    let values = Array(12 * 31).fill(0);
    let comments = Array(12 * 31).fill("");

    const newData = {
      year: year,
      values: values,
      comments: comments,
    };
    let data = new DataSchema(newData);
    await data.save();

    user.data.push(data._id);
    await user.save();
    log(res, Status.SUCCESS, "Додано дані до користувача.");
  })
);

/**
* PUT
* Редагує значення кольорів та коментарі за весь рік для поточного користувача, який увійшов у систему
*
* Необхідний вміст основного тексту:
* values ​​- Числовий масив, що представляє нові значення кольорів для цього року
* comments - Рядковий масив, що представляє нові коментарі для цього року
*/
router.route("/:year").put(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        for (let i = 0; i < 12 * 31; i++) {
          data.values.set(i, req.body.values[i]);
          data.comments.set(i, req.body.comments[i]);
        }

        await data.save();
        log(res, Status.SUCCESS, "Відредаговані дані.");

        return;
      }
    }
  })
);

/**
* ВИДАЛИТИ
* Видаляє рік для поточного користувача, який увійшов у систему
*/
router.route("/:year").delete(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);

    let user = await UserSchema.findById(req.user._id).populate("data");

    let id = -1;

    for (let i in user.data) {
      let data = user.data[i];
      if (data.year == year) {
        id = data._id;
        user.data.splice(i, 1);
        await user.save();
        break;
      }
    }

    if (id == -1)
      log(
        res,
        Status.ERROR,
        "Не вдалося знайти дані за цей рік для поточного користувача."
      );

    await DataSchema.findByIdAndDelete(id);
    log(res, Status.SUCCESS, "Дані видалено.");
  })
);

/**
* GET
* Повертає масив значень кольорів для певного року для поточного користувача, який увійшов у систему
*/
router.route("/values/:year").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        res.json(data.values);
        return;
      }
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

/**
* GET
* Повертає масив даних коментарів за певний рік для поточного користувача, який увійшов у систему
*/
router.route("/comments/:year").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        res.json(data.comments);
        return;
      }
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

/**
* GET
* Повертає JSON з даними кольору/коментарів за певну дату для поточного користувача, який увійшов у систему
*/
router.route("/:year/:month/:day").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);
    let month = parseInt(req.params.month);
    let day = parseInt(req.params.day);

    if (!validateDate(res, month, day)) return;

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        let index = (month - 1) * 31 + day - 1;
        let value = data.values[index];
        let comment = data.comments[index];
        res.json({
          value: value,
          comment: comment,
        });
        return;
      }
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

/**
* PUT
* Редагує значення кольору та коментар для певної дати для поточного користувача, який увійшов у систему
*
* Необхідний вміст тіла:
* value - Число, що представляє нове значення кольору для цієї дати
* comment - Рядок, що представляє новий коментар для цієї дати
*/
router.route("/:year/:month/:day").put(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);
    let month = parseInt(req.params.month);
    let day = parseInt(req.params.day);

    if (!validateDate(res, month, day)) return;

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        let index = (month - 1) * 31 + day - 1;
        data.values.set(index, req.body.value);
        data.comments.set(index, req.body.comment);

        await data.save();
        log(res, Status.SUCCESS, "Відредаговані дані.");

        return;
      }
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

/**
* GET
* Повертає значення кольору для певної дати для користувача, який зараз увійшов у систему
*/
router.route("/values/:year/:month/:day").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);
    let month = parseInt(req.params.month);
    let day = parseInt(req.params.day);

    if (!validateDate(res, month, day)) return;

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        let index = (month - 1) * 31 + day - 1;
        let value = data.values[index];
        res.json(value);
        return;
      }
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

/**
* PUT
* Редагує значення кольору для певної дати для поточного користувача, який увійшов у систему
*
* Необхідний вміст тіла:
* значення - Число, що представляє нове значення кольору для цієї дати
*/
router.route("/values/:year/:month/:day").put(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);
    let month = parseInt(req.params.month);
    let day = parseInt(req.params.day);

    if (!validateDate(res, month, day)) return;

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        let index = (month - 1) * 31 + day - 1;
        data.values.set(index, req.body.value);

        await data.save();
        log(res, Status.SUCCESS, "Відредаговані дані.");

        return;
      }
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

/**
* GET
* Повертає коментар для певної дати для поточного користувача, який увійшов у систему
*/
router.route("/comments/:year/:month/:day").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);
    let month = parseInt(req.params.month);
    let day = parseInt(req.params.day);

    if (!validateDate(res, month, day)) return;

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        let index = (month - 1) * 31 + day - 1;
        let comment = data.comments[index];
        res.json(comment);
        return;
      }
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

/**
* PUT
* Редагує коментар для певної дати для поточного користувача, який увійшов у систему
*
* Необхідний вміст тіла:
* коментар - рядок, що представляє новий коментар для цієї дати
*/
router.route("/comments/:year/:month/:day").put(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let year = parseInt(req.params.year);
    let month = parseInt(req.params.month);
    let day = parseInt(req.params.day);

    if (!validateDate(res, month, day)) return;

    let user = await UserSchema.findById(req.user._id).populate("data");
    for (let dataId of user.data) {
      let data = await DataSchema.findById(dataId);
      if (data.year == year) {
        let index = (month - 1) * 31 + day - 1;
        data.comments.set(index, req.body.comment);
        return;
      }

      await data.save();
      log(res, Status.SUCCESS, "Відредагований коментар.");
      return;
    }

    log(res, Status.ERROR, "Не вдалося знайти цей рік у поточного користувача");
  })
);

function validateDate(res, month, day) {
  if (
    month == undefined ||
    day == undefined ||
    month <= 0 ||
    day <= 0 ||
    month > 12 ||
    day > 31
  ) {
    log(res, Status.ERROR, "Вказана дата недійсна");
    return false;
  }

  return true;
}

module.exports = router;
