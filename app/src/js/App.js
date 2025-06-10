import FileSaver from "file-saver";
import React from "react";
import Button from "react-bootstrap/Button";
import { AlertContainer } from "react-bs-notifier";
import { Route, HashRouter as Router } from "react-router-dom";

// Main Components
import About from "./components/About";
import AppNavbar from "./components/AppNavbar";
import LoadingIndicator from "./components/LoadingIndicator";
import Login from "./components/Login";
import YearInPixels from "./components/main/PixelMood";
import Register from "./components/Register";
import RequestPasswordReset from "./components/RequestPasswordReset";
import ResetPassword from "./components/ResetPassword";
import Settings from "./components/settings/Settings";
import VerifyEmail from "./components/VerifyEmail";

// Utility
import { inLg, inSm } from "js/util/BootstrapUtils";
import {
  OverrideOption,
  OverridePrompt,
  PromptStatus,
} from "./components/OverridePrompt";
import { defaultColorSchemes } from "./util/ColorUtils";
import { getIndex } from "./util/DateUtils";
import { handleError } from "./util/ErrorUtils";
import HTTPRequest from "./util/HTTPRequest";
import { defaultBoardSettings, EmailStatus } from "./util/SettingsUtils";

import "bootstrap-slider/dist/css/bootstrap-slider.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "css/BootstrapOverrides.css";

let StyledAlert = require("./components/AlertStyle").StyledAlert;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,

      loadingMessages: [],
      alerts: [],
      overrideDataPromptStatus: PromptStatus.NONE,
      inLg: inLg(),
      inSm: inSm(),
      ...this.getDefaultData(),
    };

    this.onlineValues = null;
    this.onlineComments = null;
  }

  getDefaultData = () => {
    return {
      loggedIn: false,
      name: "",
      username: "",

      year: new Date().getFullYear(),
      currentDay: new Date().getMonth() * 31 + new Date().getDate() - 1,
      years: [new Date().getFullYear()],
      values: Array(12 * 31).fill(0),
      comments: Array(12 * 31).fill(""),
      emailStatus: EmailStatus.NO_EMAIL,
      colorSchemes: defaultColorSchemes,
      boardSettings: defaultBoardSettings,
    };
  };

  componentDidMount = () => {
    window.addEventListener("resize", this.handleResize);
    this.checkAuthenticated();
    this.addNewDayCallback();
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.handleResize);
    this.removeNewDayCallback();
  };

  componentDidUpdate = (prevProps, prevState) => {
    let prevLoading = prevState.loadingMessages.length > 0;
    let currLoading = this.state.loadingMessages.length > 0;

    if (prevLoading !== currLoading) {
      if (currLoading) {
        window.addEventListener(
          "beforeunload",
          this.showQuitWhileLoadingPrompt
        );
      } else {
        window.removeEventListener(
          "beforeunload",
          this.showQuitWhileLoadingPrompt
        );
      }
    }
  };

  handleResize = () => {
    if (this.state.inLg !== inLg()) {
      this.setState({
        inLg: inLg(),
      });
    }
    if (this.state.inSm !== inSm()) {
      this.setState({
        inSm: inSm(),
      });
    }
  };

  checkAuthenticated = async () => {
    let loadingMessage = this.createLoadingMessage(
      "Перевірка автентифікації користувача"
    );
    try {
      loadingMessage.add();
      let res = await HTTPRequest.get("authenticated");
      loadingMessage.remove();

      this.setState(
        {
          loggedIn: res.data,
        },
        () => {
          if (res.data === true) {
            this.syncData();
          }
        }
      );
    } catch (err) {
      handleError(err, this.addAlert);
      loadingMessage.remove();
    }
  };

  syncData = async () => {
    let loadingMessage = this.createLoadingMessage("Синхронізація даних користувача");
    if (this.state.loggedIn) {
      try {
        loadingMessage.add();

        let requests = [
          this.loadBasicInfo(),
          this.syncColorSchemes(),
          this.syncSettings(),
          this.loadYears().then(() => this.syncValuesAndComments()),
        ];

        await Promise.all(requests);

        loadingMessage.remove();
      } catch (err) {
        handleError(err, this.addAlert);
        loadingMessage.remove();
      }
    }
  };

  loadBasicInfo = async () => {
    let res = await HTTPRequest.get("users");
    let name = res.data.name;
    let username = res.data.username;
    let email = res.data.email;

    if (email === undefined) email = "";

    let emailStatus = EmailStatus.VERIFIED;
    if (res.data.email === "" || res.data.email === undefined) {
      this.addAlert(
        "info",
        "Додати адресу електронної пошти",
        "Перейдіть до свого профілю, щоб додати адресу електронної пошти до облікового запису!"
      );
      emailStatus = EmailStatus.NO_EMAIL;
    } else if (res.data.emailVerified === false) {
      this.addAlert(
        "попередження",
        "Неперевірена адреса електронної пошти",
        "Перевірте свою електронну пошту, щоб підтвердити її!" +
        "Можливо, вам доведеться перевірити папку зі спамом і перейти до свого профілю, щоб повторно надіслати електронний лист із підтвердженням."
      );
      emailStatus = EmailStatus.NOT_VERIFIED;
    }

    this.setState({
      name: name,
      username: username,
      email: email,
      emailStatus: emailStatus,
    });
  };

  loadYears = async () => {
    if (this.state.loggedIn) {
      let res = await HTTPRequest.get("data");

      let years = [];
      let currentYearIncluded = false;
      for (let i in res.data) {
        years.push(res.data[i].year);
        if (String(res.data[i].year) === String(this.state.year)) {
          currentYearIncluded = true;
        }
      }
      years.sort();

      return new Promise((resolve) => {
        this.setState(
          {
            year: currentYearIncluded
              ? this.state.year
              : years[years.length - 1],
            years: years,
          },
          resolve
        );
      });
    }
  };

  syncValuesAndComments = async () => {
    let res = await HTTPRequest.get("data/" + this.state.year);

    let onlineValues = res.data.values;
    let onlineComments = res.data.comments;

    let versionsDifferent = false;
    let currentModified = false;
    for (let i = 0; i < 12 * 31; i++) {
      if (
        onlineValues[i] !== this.state.values[i] ||
        onlineComments[i] !== this.state.comments[i]
      ) {
        versionsDifferent = true;
      }
      if (this.state.values[i] !== 0 || this.state.comments[i] !== "") {
        currentModified = true;
      }
      if (versionsDifferent && currentModified) break;
    }

    if (versionsDifferent && currentModified) {
      this.setState({
        overrideDataPromptStatus: PromptStatus.DATA,
      });
      this.onlineValues = onlineValues;
      this.onlineComments = onlineComments;
    }
    
    else {
      this.setState({
        values: res.data.values,
        comments: res.data.comments,
      });
      this.onlineValues = null;
      this.onlineComments = null;
    }
  };

  syncColorSchemes = async () => {
    let res = await HTTPRequest.get("color-schemes");
    let data = res.data;

    if (data.length === 0) {
      for (let i in this.state.colorSchemes) {
        let colorScheme = this.state.colorSchemes[i];
        const body = {
          red: colorScheme[0],
          green: colorScheme[1],
          blue: colorScheme[2],
          label: colorScheme[3],
          ordering: i,
        };
        await HTTPRequest.post("color-schemes", body);
      }
    } else {
      let colorSchemes = [];
      for (let colorScheme of data) {
        colorSchemes.push([
          colorScheme.red,
          colorScheme.green,
          colorScheme.blue,
          colorScheme.label,
        ]);
      }
      this.setState({
        colorSchemes: colorSchemes,
      });
    }
  };

  syncSettings = async () => {
    let res = await HTTPRequest.get("settings");
    if (res.data === "") {
      await HTTPRequest.post("settings");
      for (let [key, value] of Object.entries(this.state.boardSettings)) {
        await HTTPRequest.put("settings/" + key, { newValue: value });
      }
    } else {
      let boardSettings = {};
      for (let key of Object.keys(this.state.boardSettings)) {
        let res = await HTTPRequest.get("settings/" + key);
        if (res.data !== "") {
          boardSettings[key] = res.data;
        } else {
          await HTTPRequest.put("settings/" + key, {
            newValue: this.state.boardSettings[key],
          });
          boardSettings[key] = this.state.boardSettings[key];
        }
      }

      this.setState({
        boardSettings: boardSettings,
      });
    }
  };

  logout = async () => {
    let loadingMessage = this.createLoadingMessage("Вихід із системи");
    try {
      loadingMessage.add();
      await HTTPRequest.post("logout");
      this.setState(this.getDefaultData());
      this.addAlert("info", "Успішно вийшов із системи");
      loadingMessage.remove();
    } catch (err) {
      handleError(err, this.addAlert);
      loadingMessage.remove();
    }
  };

  checkUsernameAvailable = async (username) => {
    let loadingMessage = this.createLoadingMessage(
      "Перевірка доступності імені користувача"
    );
    try {
      loadingMessage.add();
      let res = await HTTPRequest.get(
        "users/check-available/username/" + username
      );
      loadingMessage.remove();
      return res.data === true;
    } catch (err) {
      handleError(err, this.addAlert);
      loadingMessage.remove();
    }
  };

  checkEmailAvailable = async (email) => {
    if (email === "") return true;

    let loadingMessage = this.createLoadingMessage(
      "Перевірка доступності електронної пошти"
    );
    try {
      loadingMessage.add();
      let res = await HTTPRequest.get("users/check-available/email/" + email);
      loadingMessage.remove();
      return res.data === true;
    } catch (err) {
      handleError(err, this.addAlert);
      loadingMessage.remove();
    }
  };

  register = async (name, username, password, email) => {
    const body = {
      name: name,
      username: username,
      password: password,
    };

    let loadingMessage = this.createLoadingMessage("Реєстрація користувача");
    try {
      loadingMessage.add();
      await HTTPRequest.post("users/register", body);
      this.setState(
        {
          loggedIn: true,
          name: name,
          username: username,
          email: email,
          emailStatus:
            email === "" ? EmailStatus.NO_EMAIL : EmailStatus.NOT_VERIFIED,
        },
        async () => {
          this.addAlert("info", "Успішно зареєстровано");
          this.changeEmail(email);
          this.syncColorSchemes();
          this.syncSettings();
          await this.addYear(this.state.year);
          this.uploadValuesAndComments();
          loadingMessage.remove();
        }
      );
    } catch (err) {
      handleError(err, this.addAlert, [
        ["UserExistsError", "Користувач вже існує"],
      ]);
      loadingMessage.remove();
      return false;
    }

    return true;
  };

  uploadValuesAndComments = async () => {
    if (this.state.loggedIn) {
      let loadingMessage = this.createLoadingMessage("Завантаження даних");
      try {
        const body = {
          values: this.state.values,
          comments: this.state.comments,
        };

        loadingMessage.add();
        await HTTPRequest.put("/data/" + this.state.year, body);
        loadingMessage.remove();
      } catch (err) {
        handleError(err);
        loadingMessage.remove();
      }
    }
  };

  login = async (username, password) => {
    const body = {
      username: username,
      password: password,
    };

    let loadingMessage = this.createLoadingMessage("Вхід");
    try {
      loadingMessage.add();
      await HTTPRequest.post("login", body);
      this.setState({
        loggedIn: true,
      });
      this.addAlert("info", "Успішно ввійшов/ввійшла");
      loadingMessage.remove();

      this.syncData(); // this will create it's own loading message
    } catch (error) {
      handleError(error, this.addAlert, [
        ["IncorrectPasswordError", "Неправильний пароль"],
        ["IncorrectUsernameError", "Unknown User"],
      ]);
      loadingMessage.remove();
      return false;
    }

    return true;
  };

  updateAccountInfo = async (name, username) => {
    const body = {
      name: name,
      username: username,
    };

    let loadingMessage = this.createLoadingMessage("Оновлення інформації облікового запису");
    try {
      loadingMessage.add();
      await HTTPRequest.put("users", body);
      this.setState({
        name: name,
        username: username,
      });
      this.addAlert("info", "Інформацію облікового запису успішно змінено");
      loadingMessage.remove();
    } catch (err) {
      handleError(err, this.addAlert);
      loadingMessage.remove();
    }
  };

  changePassword = async (oldPassword, newPassword) => {
    const body = {
      oldPassword: oldPassword,
      newPassword: newPassword,
    };

    let loadingMessage = this.createLoadingMessage("Зміна пароля");
    try {
      loadingMessage.add();
      await HTTPRequest.post("users/change-password", body);
      this.addAlert("info", "Пароль успішно змінено");
    } catch (err) {
      handleError(err, this.addAlert);
    }
    loadingMessage.remove();
  };

  requestPasswordReset = async (username) => {
    let loadingMessage = this.createLoadingMessage("Запит на скидання пароля");
    try {
      loadingMessage.add();
      await HTTPRequest.post("users/request-reset/" + username);
      this.addAlert("info", "Запит на скидання пароля успішно надіслано");
    } catch (err) {
      handleError(err, this.addAlert, [
        [
          "існує",
          "Користувач не існує",
          "Якщо ви вважаєте, що це помилка, зверніться до розробника",
        ],
      ]);
    }

    loadingMessage.remove();
  };

  resetPassword = async (username, token, newPassword) => {
    let loadingMessage = this.createLoadingMessage("Скидання пароля");
    try {
      loadingMessage.add();
      const body = {
        newPassword: newPassword,
      };
      await HTTPRequest.post(
        "users/reset-password/" + username + "/" + token,
        body
      );
      this.addAlert("info", "Пароль успішно змінено");
      loadingMessage.remove();
      return true;
    } catch (err) {
      handleError(err, this.addAlert, [
       [
        "Неправильний токен скидання пароля",
        "Помилка скидання пароля (неправильний токен)",
        "Будь ласка, повторно надішліть запит на скидання пароля",
        ],
        [
        "термін дії минув",
        "Посилання для скидання пароля минув",
        "Будь ласка, повторно надішліть запит на скидання пароля",
        ],
      ]);
      loadingMessage.remove();
      return false;
    }
  };

  deleteAccount = async () => {
    let loadingMessage = this.createLoadingMessage("Видалення облікового запису");
    try {
      loadingMessage.add();
      await HTTPRequest.delete("users");
      this.setState(this.getDefaultData());
      this.addAlert("info", "Обліковий запис успішно видалено");
    } catch (err) {
      handleError(err, this.addAlert);
    }

    loadingMessage.remove();
  };

  updateBoardSettings = async (newBoardSettings) => {
    let loadingMessage = this.createLoadingMessage("Oновлення налаштувань дошки");

    try {
      loadingMessage.add();
      this.setState({
        boardSettings: newBoardSettings,
      });

      for (let [key, value] of Object.entries(newBoardSettings)) {
        await HTTPRequest.put("settings/" + key, { newValue: value });
      }

      loadingMessage.remove();
    } catch (err) {
      handleError(err, this.addAlert);
      loadingMessage.remove();
    }
  };

  exportUserData = async () => {
    let loadingMessage = this.createLoadingMessage("Експорт даних користувача");

    try {
      loadingMessage.add();
      let res = await HTTPRequest.get("users/full-data");
      let json = JSON.stringify(res.data);
      let blob = new Blob([json], { type: "application/json" });
      FileSaver.saveAs(blob, this.state.username + "_data.json");
    } catch (err) {
      handleError(err, this.addAlert);
    }

    loadingMessage.remove();
  };

  changeYear = async (newYear) => {
    let loadingMessage = this.createLoadingMessage("Зміна року");
    loadingMessage.add();
    // wipe data to prevent any overriding issues
    this.setState(
      {
        year: newYear,
        values: Array(12 * 31).fill(0),
        comments: Array(12 * 31).fill(""),
      },
      async () => {
        try {
          await this.syncValuesAndComments();
          loadingMessage.remove();
        } catch (err) {
          handleError(err, this.addAlert);
          loadingMessage.remove();
        }
      }
    );
  };

  addYear = async (newYear) => {
    if (this.state.loggedIn) {
      let loadingMessage = this.createLoadingMessage("Додавання року");
      try {
        loadingMessage.add();
        await HTTPRequest.post("data/" + newYear);
        loadingMessage.remove();
      } catch (err) {
        handleError(err, this.addAlert);
        loadingMessage.remove();
      }
      await this.changeYear(newYear);
      await this.loadYears();
    }
  };

  deleteYear = async (year) => {
    if (this.state.loggedIn) {
      let loadingMessage = this.createLoadingMessage("Видалення року");
      try {
        loadingMessage.add();
        await HTTPRequest.delete("data/" + year);

        let index = this.state.years.indexOf(parseInt(year));
        let newYears = this.state.years.slice();

        newYears.splice(index, 1);
        let newIndex = index === 0 ? 0 : index - 1;

        this.setState(
          {
            years: newYears,
            year: newYears[newIndex],
          },
          async () => {
            try {
              await this.syncValuesAndComments();
              loadingMessage.remove();
            } catch (err) {
              handleError(err, this.addAlert);
              loadingMessage.remove();
            }
          }
        );

        loadingMessage.remove();
      } catch (err) {
        handleError(err, this.addAlert);
        loadingMessage.remove();
      }
    }
  };

  checkYearExists = async (year) => {
    for (let i = 0; i < this.state.years.length; i++) {
      if (String(this.state.years[i]) === String(year)) {
        return true;
      }
    }

    return false;
  };

  handleDataOverride = async (overrideOption) => {
    let loadingMessage = this.createLoadingMessage("Обробка об'єднання даних");
    loadingMessage.add();
    switch (overrideOption) {
      case OverrideOption.REPLACE_CURRENT:
        this.onlineValues = this.state.values;
        this.onlineComments = this.state.comments;
        break;
      case OverrideOption.REPLACE_ONLINE:
        this.setState({
          values: this.onlineValues,
          comments: this.onlineComments,
        });
        break;
      case OverrideOption.MERGE_CURRENT:
        for (let i = 0; i < 12 * 31; i++) {
          if (this.state.values[i] !== this.onlineValues[i]) {
            if (this.state.values[i] !== 0) {
              this.onlineValues[i] = this.state.values[i];
            }
          }
          if (this.state.comments[i] !== this.onlineComments[i]) {
            if (this.state.comments[i] !== 0) {
              this.onlineComments[i] = this.state.comments[i];
            }
          }
        }

        this.setState({
          values: this.onlineValues,
          comments: this.onlineComments,
        });
        break;
      case OverrideOption.MERGE_ONLINE:
        for (let i = 0; i < 12 * 31; i++) {
          if (this.state.values[i] !== this.onlineValues[i]) {
            if (this.onlineValues[i] === 0) {
              this.onlineValues[i] = this.state.values[i];
            }
          }
          if (this.state.comments[i] !== this.onlineComments[i]) {
            if (this.onlineComments[i] === "") {
              this.onlineComments[i] = this.state.comments[i];
            }
          }
        }

        this.setState({
          values: this.onlineValues,
          comments: this.onlineComments,
        });
        break;
      default:
        break;
    }

    try {
      const body = {
        values: this.onlineValues,
        comments: this.onlineComments,
      };

      await HTTPRequest.put("/data/" + this.state.year, body);
      this.addAlert("info", "Оброблене об'єднання даних");
    } catch (err) {
      handleError(err, this.addAlert);
    }

    loadingMessage.remove();

    this.onlineValues = null;
    this.onlineComments = null;

    this.setState({
      overrideDataPromptStatus: PromptStatus.NONE,
    });
  };

  updateBoardData = async (month, day, value, comment) => {
    let loadingMessage = this.createLoadingMessage("Оновлення даних ради директорів");
    loadingMessage.add();

    let valuesCopy = this.state.values.slice();
    valuesCopy[getIndex(month, day)] = value;

    let commentsCopy = this.state.comments.slice();
    commentsCopy[getIndex(month, day)] = comment;

    this.setState({
      values: valuesCopy,
      comments: commentsCopy,
    });

    if (this.state.loggedIn) {
      try {
        const body = {
          value: value,
          comment: comment,
        };

        await HTTPRequest.put(
          "/data/" + this.state.year + "/" + (month + 1) + "/" + (day + 1),
          body
        );
      } catch (err) {
        handleError(err, this.addAlert);
      }
    }

    loadingMessage.remove();
  };

  changeColorSchemeOrder = async (startIndex, endIndex) => {
    let loadingMessage = this.createLoadingMessage(
      "Зміна порядку колірної схеми"
    );
    loadingMessage.add();

    let newColorSchemes = this.state.colorSchemes.slice();
    let [removed] = newColorSchemes.splice(startIndex, 1);
    newColorSchemes.splice(endIndex, 0, removed);

    let indices = Array.from(Array(newColorSchemes.length).keys());
    let [removedIndices] = indices.splice(startIndex, 1);
    indices.splice(endIndex, 0, removedIndices);

    let newValues = this.state.values.slice();
    for (let i = 0; i < 12 * 31; i++) {
      newValues[i] = indices.indexOf(newValues[i] - 1) + 1;
    }

    this.setState({
      colorSchemes: newColorSchemes,
      values: newValues,
    });

    if (this.state.loggedIn) {
      try {
        let bodyLabels = [];
        let bodyOrderings = [];

        for (let i in newColorSchemes) {
          let colorScheme = newColorSchemes[i];
          bodyLabels.push(colorScheme[3]);
          bodyOrderings.push(i);
        }

        const body = {
          labels: bodyLabels,
          orderings: bodyOrderings,
          indices: indices,
          year: this.state.year,
        };

        let res = await HTTPRequest.post(
          "/color-schemes/change-orderings",
          body
        );

        this.setState({
          values: res.data,
        });
      } catch (err) {
        handleError(err, this.addAlert);
      }
    }

    loadingMessage.remove();
  };

  // color is passed in as "#RRGGBB"
  addColorScheme = async (label, color) => {
    let loadingMessage = this.createLoadingMessage("Додавання кольору");
    loadingMessage.add();

    let colorSchemes = this.state.colorSchemes.slice();
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    colorSchemes.push([r, g, b, label]);

    this.setState({
      colorSchemes: colorSchemes,
    });

    if (this.state.loggedIn) {
      try {
        const body = {
          red: r,
          green: g,
          blue: b,
          label: label,
        };
        await HTTPRequest.post("color-schemes", body);
      } catch (err) {
        handleError(err, this.addAlert);
      }
    }

    loadingMessage.remove();
  };

  // newColor is passed in as "#RRGGBB"
  editColorScheme = async (originalLabel, newLabel, newColor) => {
    let loadingMessage = this.createLoadingMessage("Редагування кольору");
    loadingMessage.add();

    let colorSchemes = this.state.colorSchemes.slice();
    let r = parseInt(newColor.substring(1, 3), 16);
    let g = parseInt(newColor.substring(3, 5), 16);
    let b = parseInt(newColor.substring(5, 7), 16);
    let index = -1;
    for (let i = 0; i < colorSchemes.length; i++) {
      if (colorSchemes[i][3] === originalLabel) {
        colorSchemes[i] = [r, g, b, newLabel];
        index = i;
        break;
      }
    }
    this.setState({
      colorSchemes: colorSchemes,
    });

    if (this.state.loggedIn && index !== -1) {
      try {
        const body = {
          red: r,
          green: g,
          blue: b,
          label: newLabel,
          ordering: index,
        };
        await HTTPRequest.put("color-schemes/" + originalLabel, body);
      } catch (err) {
        handleError(err, this.addAlert);
      }
    }

    loadingMessage.remove();
  };

  deleteColorScheme = async (label) => {
    let loadingMessage = this.createLoadingMessage("Видалення кольору");
    loadingMessage.add();

    let newColorSchemes = this.state.colorSchemes.slice();
    let index = -1;
    for (let i = 0; i < newColorSchemes.length; i++) {
      if (newColorSchemes[i][3] === label) {
        index = i;
        break;
      }
    }
    newColorSchemes.splice(index, 1);

    let indices = Array.from(Array(this.state.colorSchemes.length).keys());
    indices.splice(index, 1);

    let newValues = this.state.values.slice();
    for (let i = 0; i < 12 * 31; i++) {
      newValues[i] = indices.indexOf(newValues[i] - 1) + 1;
    }

    this.setState({
      colorSchemes: newColorSchemes,
      values: newValues,
    });

    if (this.state.loggedIn && index !== -1) {
      try {
        await HTTPRequest.delete("color-schemes/" + label);

        let bodyLabels = [];
        let bodyOrderings = [];

        for (let i in newColorSchemes) {
          let colorScheme = newColorSchemes[i];
          bodyLabels.push(colorScheme[3]);
          bodyOrderings.push(i);
        }

        const body = {
          labels: bodyLabels,
          orderings: bodyOrderings,
          indices: indices,
          year: this.state.year,
        };

        let res = await HTTPRequest.post(
          "/color-schemes/change-orderings",
          body
        );

        this.setState({
          values: res.data,
        });
      } catch (err) {
        handleError(err, this.addAlert);
      }
    }

    loadingMessage.remove();
  };

  checkLabelExists = (label) => {
    for (let i = 0; i < this.state.colorSchemes.length; i++) {
      if (this.state.colorSchemes[i][3] === label) {
        return true;
      }
    }

    return false;
  };

  addNewDayCallback = () => {
    let today = new Date();
    let midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    let millis = midnight.getTime() - today.getTime();

    setTimeout(this.updateDay, millis);
  };

  removeNewDayCallback = () => {
    clearTimeout(this.updateDay);
  };

  updateDay = () => {
    this.setState({
      currentDay: new Date().getMonth() * 31 + new Date().getDate() - 1,
    });

    this.addNewDayCallback();
  };

  changeEmail = async (email) => {
    let loadingMessage = this.createLoadingMessage(
      "Додавання/зміна адреси електронної пошти"
    );
    loadingMessage.add();

    if (this.state.loggedIn) {
      try {
        await HTTPRequest.post("/users/change-email/" + email);
        this.addAlert(
          "Інформація",
          "Додано/змінено адресу електронної пошти",
          "Будь ласка, перевірте папку Вхідні та Спам, щоб підтвердити свою адресу електронної пошти!"
        );
      } catch (err) {
        handleError(err, this.addAlert, [
          [
            "Не вдалося перевірити користувача: електронна адреса",
            "Електронна адреса недійсна!",
            "Якщо ваша адреса електронної пошти дійсна, надішліть звіт про помилку!",
          ],
        ]);
      }
    }

    loadingMessage.remove();
  };

  resendEmailVerification = async () => {
    let loadingMessage = this.createLoadingMessage(
      "Повторне надсилання електронного листа з підтвердженням"
    );
    loadingMessage.add();

    if (this.state.loggedIn) {
      try {
        await HTTPRequest.post("/users/resend-verification-email/");
        this.addAlert(
          "Інформація",
          "Повторно надіслати електронний лист із підтвердженням",
          "Будь ласка, перевірте свою поштову скриньку та папку зі спамом, щоб підтвердити свою адресу електронної пошти!"
        );
      } catch (err) {
        handleError(err, this.addAlert);
      }
    }

    loadingMessage.remove();
  };

  verifyEmail = async (user, token) => {
    let loadingMessage = this.createLoadingMessage("Підтвердження електронної пошти");
    loadingMessage.add();

    try {
      await HTTPRequest.post("/users/verify-email/" + user + "/" + token);
      loadingMessage.remove();
      return true;
    } catch (err) {
      handleError(err, this.addAlert, [
        [
        "Неправильний токен підтвердження електронної пошти",
        "Помилка підтвердження електронної пошти (неправильний токен)",
        "Будь ласка, повторно надішліть запит на підтвердження електронної пошти",
        ],
        [
        "термін дії минув",
        "Посилання для підтвердження електронної пошти минув",
        "Будь ласка, повторно надішліть запит на підтвердження електронної пошти",
        ],
      ]);
      loadingMessage.remove();
      return false;
    }
  };

  addAlert = (type, headline, message) => {
    let alerts = this.state.alerts.slice();
    alerts.push({
      id: new Date().getTime(),
      type: type,
      headline: headline,
      message: message,
    });

    if (alerts.length > 4) {
      alerts.shift();
    }

    this.setState({
      alerts: alerts,
    });
  };

  onDismissAlert = (alert) => {
    let i = this.state.alerts.indexOf(alert);
    if (i < 0) return;

    let alerts = this.state.alerts.slice();
    alerts.splice(i, 1);

    this.setState({
      alerts: alerts,
    });
  };

  clearAllAlerts = () => {
    this.setState({
      alerts: [],
    });
  };

  createLoadingMessage = (message) => {
    function add() {
      this.setState((state) => {
        let loadingMessages = state.loadingMessages.slice();
        loadingMessages.push(message);
        return {
          loadingMessages: loadingMessages,
        };
      });
    }

    function remove() {
      this.setState((state) => {
        let loadingMessages = state.loadingMessages.slice();
        let index = loadingMessages.indexOf(message);
        if (index !== -1) {
          loadingMessages.splice(index, 1);
          return {
            loadingMessages: loadingMessages,
          };
        } else {
          return {};
        }
      });
    }

    let bindedAdd = add.bind(this);
    let bindedRemove = remove.bind(this);

    return {
      add: bindedAdd,
      remove: bindedRemove,
    };
  };

  showQuitWhileLoadingPrompt = (e) => {
    e.preventDefault();
    let message =
      "Додаток зараз зберігає ваші дані. Якщо ви вийдете до збереження, ваші зміни можуть бути втрачені.";
    e.returnValue = message;
    return message;
  };

  render() {
    return (
      <Router>
        <AppNavbar
          loggedIn={this.state.loggedIn}
          username={this.state.username}
          logout={this.logout}
          inLg={this.state.inLg}
          inSm={this.state.inSm}
        />
        <Route path="/" exact>
          <YearInPixels
            loggedIn={this.state.loggedIn}
            year={this.state.year}
            years={this.state.years}
            changeYear={this.changeYear}
            addYear={this.addYear}
            deleteYear={this.deleteYear}
            checkYearExists={this.checkYearExists}
            showAddYearModal={this.showAddYearModal}
            currentDay={this.state.currentDay}
            values={this.state.values}
            comments={this.state.comments}
            colorSchemes={this.state.colorSchemes}
            updateBoardData={this.updateBoardData}
            changeColorSchemeOrder={this.changeColorSchemeOrder}
            addColorScheme={this.addColorScheme}
            editColorScheme={this.editColorScheme}
            deleteColorScheme={this.deleteColorScheme}
            checkLabelExists={this.checkLabelExists}
            boardSettings={this.state.boardSettings}
            inLg={this.state.inLg}
            inSm={this.state.inSm}
            createLoadingMessage={this.createLoadingMessage}
          />
        </Route>
        <Route path="/register">
          <Register
            register={this.register}
            checkUsernameAvailable={this.checkUsernameAvailable}
            checkEmailAvailable={this.checkEmailAvailable}
          />
        </Route>
        <Route path="/login">
          <Login login={this.login} />
        </Route>
        <Route path="/settings">
          <Settings
            loggedIn={this.state.loggedIn}
            inLg={this.state.inLg}
            name={this.state.name}
            username={this.state.username}
            checkUsernameAvailable={this.checkUsernameAvailable}
            checkEmailAvailable={this.checkEmailAvailable}
            updateAccountInfo={this.updateAccountInfo}
            changePassword={this.changePassword}
            deleteAccount={this.deleteAccount}
            email={this.state.email}
            emailStatus={this.state.emailStatus}
            changeEmail={this.changeEmail}
            resendEmailVerification={this.resendEmailVerification}
            boardSettings={this.state.boardSettings}
            updateBoardSettings={this.updateBoardSettings}
            exportUserData={this.exportUserData}
          />
        </Route>
        <Route
          path="/verify/:username/:token"
          render={(matchProps) => (
            <VerifyEmail {...matchProps} verifyEmail={this.verifyEmail} />
          )}
        />
        <Route path="/request-reset">
          <RequestPasswordReset
            requestPasswordReset={this.requestPasswordReset}
          />
        </Route>
        <Route
          path="/reset-password/:username/:token"
          render={(matchProps) => (
            <ResetPassword {...matchProps} resetPassword={this.resetPassword} />
          )}
        />
        <Route path="/about">
          <About />
        </Route>
        
        <OverridePrompt
          status={this.state.overrideDataPromptStatus}
          handleDataOverride={this.handleDataOverride}
          handleColorSchemeOverride={this.handleColorSchemeOverride}
        />
        <LoadingIndicator messages={this.state.loadingMessages} />
        <AlertContainer position="bottom-left">
          {this.state.alerts.length > 0 && (
            <Button
              className="mb-1"
              variant="danger"
              onClick={this.clearAllAlerts}
            >
              Clear All Alerts
            </Button>
          )}
          {this.state.alerts.map((alert) => {
            return (
              <StyledAlert
                timeout={10000}
                onDismiss={() => {
                  this.onDismissAlert(alert);
                }}
                type={alert.type}
                key={alert.id}
                headline={alert.headline}
              >
                {alert.message}
              </StyledAlert>
            );
          })}
        </AlertContainer>
      </Router>
    );
  }
}

export default App;
