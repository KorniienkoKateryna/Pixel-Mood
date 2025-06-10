const router = require("express").Router();
const passport = require("passport");
let { log, Status } = require("./route_logger");

/**
 * POST
 * Авторизує користувача в системі з наданими обліковими даними.
 * Зберігає інформацію про сесію та повертає ідентифікатор сесії у cookie.
 *
 * Обов'язкові дані в тілі запиту:
 *  username — ім’я користувача
 *  password — пароль
 */
router.route("/login").post((req, res, next) => {
  if (req.isAuthenticated()) {
    log(res, Status.ERROR, "Користувач вже авторизований.");
    return;
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      log(res, Status.ERROR, err);
      return;
    }

    if (!user) {
      log(res, Status.ERROR, info);
      return;
    }

    req.logIn(user, (err) => {
      if (err) {
        log(res, Status.ERROR, err);
        return;
      }

      log(res, Status.SUCCESS, "Успішний вхід у систему.");
    });
  })(req, res, next);
});

/**
 * POST
 * Вихід користувача із системи
 */
router.route("/logout").post((req, res, next) => {
  if (req.isAuthenticated()) {
    req.logOut();
    log(res, Status.SUCCESS, "Успішний вихід із системи.");
  } else {
    log(res, Status.ERROR, "Користувач не авторизований.");
  }
});

/**
 * GET
 * Повертає, чи авторизований поточний користувач
 */
router.route("/authenticated").get((req, res, next) => {
  res.json(req.isAuthenticated());
});

module.exports = router;
