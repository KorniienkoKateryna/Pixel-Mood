const router = require("express").Router();
let UserSchema = require("../models/user.model");
let DataSchema = require("../models/data.model");
let ColorSchemeSchema = require("../models/color_scheme.model");
const passport = require("passport");
const asyncHandler = require("express-async-handler");
let { log, Status } = require("./route_logger");

/**
* GET
* Повертає масив усіх колірних схем для поточного користувача, який увійшов у систему
*/
router.route("/").get(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id).populate({
      path: "colorSchemes",
      options: {
        sort: {
          ordering: 1,
        },
      },
    });
    res.json(user.colorSchemes);
  })
);

/**
* POST
* Додає колірну схему для поточного користувача, який увійшов у систему
*
* Необхідний вміст тіла:
* red - ціле число від 0 до 255 для червоного значення колірної схеми
* green - ціле число від 0 до 255 для синього значення колірної схеми
* blue - ціле число від 0 до 255 для зеленого значення колірної схеми
* label - рядок для назви колірної схеми
 */
router.route("/").post(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    // перевіряємо, чи ця мітка колірної схеми вже існує
    let user = await UserSchema.findById(req.user._id).populate("colorSchemes");

    for (let colorScheme of user.colorSchemes) {
      if (colorScheme.label == req.body.label) {
        log(res, Status.ERROR, "Колірна схема з такою міткою вже існує.");
        return;
      }
    }

    const newColorScheme = {
      red: Number(req.body.red),
      green: Number(req.body.green),
      blue: Number(req.body.blue),
      label: req.body.label,
      ordering: user.colorSchemes.length, 
    };
    let colorScheme = new ColorSchemeSchema(newColorScheme);
    await colorScheme.save();

    user.colorSchemes.push(colorScheme._id);
    await user.save();
    log(res, Status.SUCCESS, "Додано колірну схему для користувача.");
  })
);

/**
* PUT
* Редагує колірну схему поточного користувача
*
* Необхідний вміст тіла:
* red - Нове ціле число від 0 до 255 для червоного значення колірної схеми
* green - Нове ціле число від 0 до 255 для синього значення колірної схеми
* blue - Нове ціле число від 0 до 255 для зеленого значення колірної схеми
* label - Новий рядок для назви колірної схеми
* ordering - Нове ціле число для відносного впорядкування колірної схеми
*/
router.route("/:queryLabel").put(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id).populate("colorSchemes");

    let colorSchemeFound = null;
    for (let colorScheme of user.colorSchemes) {
      if (colorScheme.label == req.params.queryLabel) {
        colorSchemeFound = colorScheme;
        break;
      }
    }

    if (colorSchemeFound === null) {
      log(
        res,
        Status.ERROR,
        "Не вдалося знайти колірну схему з такою міткою у поточного користувача."
      );
      return;
    }

    colorSchemeFound.red = req.body.red;
    colorSchemeFound.green = req.body.green;
    colorSchemeFound.blue = req.body.blue;
    colorSchemeFound.label = req.body.label;
    colorSchemeFound.ordering = req.body.ordering;
    await colorSchemeFound.save();

    log(res, Status.SUCCESS, "Відредагована кольорова схема.");
  })
);

/**
* ВИДАЛИТИ
* Видаляє колірну схему поточного користувача, який увійшов у систему
*/
router.route("/:queryLabel").delete(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    let user = await UserSchema.findById(req.user._id).populate("colorSchemes");

    let colorSchemeFound = null;
    for (let i in user.colorSchemes) {
      let colorScheme = user.colorSchemes[i];
      if (colorScheme.label == req.params.queryLabel) {
        colorSchemeFound = colorScheme;
        user.colorSchemes.splice(i, 1);
        await user.save();
        break;
      }
    }

    if (colorSchemeFound === null) {
      log(
        res,
        Status.ERROR,
        "Не вдалося знайти колірну схему цієї мітки у поточного користувача."
      );
      return;
    }

    await colorSchemeFound.deleteOne();

    log(res, Status.SUCCESS, "Колірна схема видалена.");
  })
);

/**
* POST
* Змінює значення порядку заданого набору міток колірних схем. Приймає необов'язковий набір аргументів, які дозволяють * повертати змінені значення даних.
*
* Необхідний вміст тіла:
* labels - масив рядків, що містять мітки колірних схем, які потрібно змінити
* orderings - масив цілих чисел, що містить відповідні нові порядки заданих колірних схем
*
* indexes - (НЕОБОВ'ЯЗКОВО) масив цілих чисел, що визначають, як змінився порядок. Це використовується для визначення того, як змінити * дані користувача, щоб зберегти ті самі кольори
* year - (НЕОБОВ'ЯЗКОВО) поточний рік для обробки (всі роки будуть оновлені, але буде повернуто цей рік)
*/
router.route("/change-orderings").post(
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      log(res, Status.ERROR, "Користувач не ввійшов у систему");
      return;
    }

    if (req.body.labels.length !== req.body.orderings.length) {
      log(res, Status.ERROR, "Довжини масивів не збігаються");
      return;
    }

    let user = await UserSchema.findById(req.user._id)
      .populate("colorSchemes")
      .populate("data");

    for (let i in req.body.labels) {
      let label = req.body.labels[i];
      let ordering = req.body.orderings[i];

      for (let j in user.colorSchemes) {
        if (user.colorSchemes[j].label === label) {
          user.colorSchemes[j].ordering = ordering;
          await user.colorSchemes[j].save();
          break;
        }
      }
    }

    if (req.body.indices !== undefined) {
      let returnValue = undefined;
      let year = parseInt(req.body.year);
      for (let i in user.data) {
        for (let d = 0; d < 12 * 31; d++) {
          user.data[i].values.set(
            d,
            req.body.indices.indexOf(user.data[i].values[d] - 1) + 1
          );
        }
        await user.data[i].save();
        if (user.data[i].year === year) {
          returnValue = user.data[i].values;
        }
      }

      res.json(returnValue);
    } else {
      log(res, Status.SUCCESS, "Оновлено порядок колірних схем!");
    }
  })
);

module.exports = router;
