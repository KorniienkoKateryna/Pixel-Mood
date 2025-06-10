import React from "react";
import Select from "react-select";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { DeleteButton } from "js/components/main/IconButton";

let selectStyles = require("./YearSelectStyle").selectStyles;

export default class YearSelector extends React.Component {
  onChangeYear = (option) => {
    let newYear = option.value;

    if (newYear === "Add") {
      this.props.showAddYearModal();
      return;
    }

    this.props.changeYear(newYear);
  };

  addSelectOverlay = (component) => {
    return (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="tooltip-disabled">
            Створіть акаунт, щоб мати доступ до кількох років!
          </Tooltip>
        }
      >
        <div className="flex-grow-1" style={{ maxWidth: "250px" }}>
          {component}
        </div>
      </OverlayTrigger>
    );
  };

  createDeleteButton = (disabledForNoAccount, disabledForYearsLength) => {
    let button = (
      <DeleteButton
        disabled={disabledForNoAccount || disabledForYearsLength}
        handleClick={() => {
          console.log("Видалення року: " + this.props.year);
          this.props.deleteYear(this.props.year);
        }}
        inLg={this.props.inLg}
      />
    );

    if (disabledForNoAccount || disabledForYearsLength) {
      return (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="tooltip-disabled">
              {disabledForNoAccount
                ? "Створіть акаунт, щоб мати доступ до кількох років!"
                : "Ви не можете видалити єдиний рік! Створіть ще один запис, щоб мати змогу видалити цей."}
            </Tooltip>
          }
        >
          <span style={{ display: "inline-block" }}>{button}</span>
        </OverlayTrigger>
      );
    }

    return button;
  };

  render() {
    let options = this.props.years.map((option) => {
      return {
        value: String(option),
        label: String(option),
      };
    });

    options.push({
      value: "Add",
      label: "Додати рік",
    });

    let select = (
      <Select
        value={{ value: this.props.year, label: this.props.year }}
        options={options}
        isDisabled={this.props.disabled}
        onChange={this.onChangeYear}
        styles={selectStyles}
        className="flex-grow-1"
        isSearchable={false}
        style={{ maxWidth: "250px" }}
      />
    );

    select = this.props.disabled ? this.addSelectOverlay(select) : select;

    return (
      <Container className={this.props.className}>
        <Row>
          <Col className="d-flex justify-content-center px-0">
            <p
              className="text-right my-auto mr-2"
              style={{ fontWeight: 520, fontSize: "1.15rem" }}
            >
              Оберіть рік:
            </p>
            {select}
            {this.createDeleteButton(
              this.props.disabled,
              this.props.years.length === 1
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}
