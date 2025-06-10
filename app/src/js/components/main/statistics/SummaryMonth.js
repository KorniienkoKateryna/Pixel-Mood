import React, { Component, Fragment } from "react";
import Table from "react-bootstrap/Table";
import { FULL_MONTH_NAMES } from "js/components/main/Constants";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

export default class SummaryMonth extends Component {
  getItemColorPreviewStyle(colorScheme) {
    return {
      backgroundColor:
        "rgb(" +
        colorScheme[0] +
        "," +
        colorScheme[1] +
        "," +
        colorScheme[2] +
        ")",
      border: "1px solid black",
      height: "1.5em",
      width: "1.5em",
      margin: "auto 0.5em auto 0.4em",
      display: "inline-block",
      verticalAlign: "middle",
    };
  }

  render() {
    let monthAverage = [];
    for (let month = 0; month < 12; month++) {
      let total = 0;
      let num = 0;
      for (let day = 0; day < 31; day++) {
        let value = this.props.values[month * 31 + day];
        if (value !== 0) {
          total += value;
          num++;
        }
      }

      if (num === 0) {
        monthAverage.push("Немає даних");
      } else {
        monthAverage.push((total / num).toFixed(2));
      }
    }

    let tableBody = monthAverage.map((average, index) => {
      let roundedAverage = parseInt(Math.round(parseFloat(average)));
      let color = this.props.colorSchemes[roundedAverage - 1];

      return (
        <tr key={index}>
          <td>{FULL_MONTH_NAMES[index]}</td>
          <td>
            {color !== undefined && (
              <Fragment>
                <span style={this.getItemColorPreviewStyle(color)} />
              </Fragment>
            )}
          </td>
          <td>{average}</td>
        </tr>
      );
    });

    let numColorSchemes = this.props.colorSchemes.length;

    if (numColorSchemes === 0) {
      return <h5>Неможливо обчислити — немає кольорів</h5>;
    }

    return (
      <Fragment>
        <h5>Середній колір за місяць</h5>
        <Table striped hover>
          <thead>
            <tr>
              <th>Місяць</th>
              <th>Середній колір</th>
              <th>
                <text>Оцінка</text>
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-disabled">
                      <p className="mb-0">1 = {this.props.colorSchemes[0][3]}</p>
                      <p className="mb-3">
                        {numColorSchemes} = {this.props.colorSchemes[numColorSchemes - 1][3]}
                      </p>
                      <p className="mb-0">
                        Ми усереднюємо всі значення за цей місяць і на основі цієї
                        оцінки (округленої до найближчого цілого) визначаємо колір місяця.
                      </p>
                    </Tooltip>
                  }
                  placement="bottom"
                >
                  <AiOutlineQuestionCircle className="ml-1" />
                </OverlayTrigger>
              </th>
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </Table>
      </Fragment>
    );
  }
}
