import React, { Component } from "react";
import Table from "react-bootstrap/Table";

export default class CountTable extends Component {
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
    // ✅ Перевірка на наявність та коректність даних
    if (
      !this.props.data ||
      !Array.isArray(this.props.data.freq) ||
      !Array.isArray(this.props.data.colorSchemes)
    ) {
      return <p>Дані не завантажені або недоступні.</p>;
    }

    const freq = this.props.data.freq;
    const schemes = this.props.data.colorSchemes;
    const minLength = Math.min(freq.length, schemes.length);

    const tableBody = Array.from({ length: minLength }).map((_, index) => {
      const color = schemes[index];
      return (
        <tr key={index}>
          <td>
            <span style={this.getItemColorPreviewStyle(color)}></span>
          </td>
          <td>{color[3]}</td>
          <td>{freq[index]}</td>
        </tr>
      );
    });

    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>Колір</th>
            <th>Мітка</th>
            <th>Кількість</th>
          </tr>
        </thead>
        <tbody>{tableBody}</tbody>
      </Table>
    );
  }
}
