// Імпортуємо необхідні модулі
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const colorSchemeRouter = require('./routes/color_scheme');
const dataRouter = require('./routes/data');
const settingsRouter = require('./routes/settings');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const passport = require('passport');
const User = require('./models/user.model'); // модель як клас mongoose
const morgan = require('morgan');



require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Налаштування сесії
const session = expressSession({
  secret: process.env.SESSION_SECRET || 'mysecret',
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'strict' },
});

// Middlewares
app.use(cors({
  credentials: true,
  origin: function(origin, callback) {
    callback(null, true);
  }
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

// Налаштування стратегії авторизації
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Підключення до MongoDB
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('✅ Підключено до MongoDB!');
});

// Підключення маршрутів
app.use('/', loginRouter);
app.use('/users', usersRouter);
app.use('/color-schemes', colorSchemeRouter);
app.use('/data', dataRouter);
app.use('/settings', settingsRouter);
app.use(morgan('dev'));

// Роздача зібраного React-додатку
app.use(express.static('app/build'));

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер запущено на порту: ${port}`);
});
