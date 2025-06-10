import React from "react";
import { Container } from "react-bootstrap";

let headerClassName = "display-4 text-center mx-auto mb-4";

export default class About extends React.Component {
  render() {
    return (
      <Container>
        <div className="text-center mx-auto px-3 py-3 mb-3">
          <h1 className="display-4">Піксельний щоденник настрою</h1>
          <p className="lead mb-3">Курсова робота</p>
          <p className="lead mb-0">
            Тема: Розробка вебзастосунку для ведення особистого щоденника настрою з візуалізацією емоційних станів
          </p>
          <p className="lead">Виконала: студентка групи ІСТ-3 Корнієнко Катерина Сергіївна</p>
        </div>

        <hr />

        <h2 className={headerClassName}>Мета роботи</h2>
        <p className="lead">
          Розробити інтерактивний вебзастосунок у форматі піксельного календаря настрою, який дозволяє користувачу фіксувати, зберігати та аналізувати свій емоційний стан протягом року за допомогою кольорових маркерів.
        </p>

        <hr />

        <h2 className={headerClassName}>Актуальність</h2>
        <p className="lead">
          У сучасному суспільстві все більше людей звертаються до цифрових інструментів для підтримки психічного здоров’я та самопізнання. Більшість наявних додатків для трекінгу настрою не враховують індивідуальні особливості або мають складний інтерфейс. Розробка зручного, візуально привабливого та адаптованого під користувача вебзастосунку сприятиме щоденному самоспостереженню та емоційній грамотності.
        </p>

        <hr />

        <h2 className={headerClassName}>Про застосунок</h2>
        <ul className="lead">
          <li>Щоденник у форматі "Pixel Mood" — кольоровий календар року</li>
          <li>Фіксація емоційного стану кожного дня за допомогою кольорів</li>
          <li>Можливість додавати коментарі до кожного дня</li>
          <li>Зберігання даних на сервері</li>
          <li>Статистика, графіки та візуалізація настрою</li>
        </ul>

        <hr />

        <h2 className={headerClassName}>Використані технології</h2>
        <ul className="lead">
          <li><strong>Frontend:</strong> React.js, React Bootstrap, Recharts, Axios</li>
          <li><strong>Backend:</strong> Express.js, MongoDB, Mongoose, Passport.js</li>
        </ul>
      </Container>
    );
  }
}
