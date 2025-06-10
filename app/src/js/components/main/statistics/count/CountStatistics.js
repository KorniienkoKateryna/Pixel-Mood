import { Component } from "react";
import Select from "react-select";
import { FULL_MONTH_NAMES, DAYS_PER_MONTH } from "js/components/main/Constants";
import { selectStyles } from "./CountSelectStyles";
import CountTable from "./CountTable";
import CountBarGraph from "./CountBarGraph";
import CountPieChart from "./CountPieChart";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { isLeapYear } from "js/util/DateUtils";

export default class CountStatistics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      monthOption: "Увесь рік",
      displayOption: "Таблиця",
    };
  }

  onChangeMonth = (option) => {
    this.setState({
      monthOption: option.value
    });
  };

  onChangeDisplay = (option) => {
    this.setState({
      displayOption: option.value
    });
  };

  render() {
    let monthOptions = FULL_MONTH_NAMES.map((monthName) => {
      return {
        value: monthName,
        label: monthName,
      };
    });
    monthOptions.unshift({
      value: "Увесь рік",
      label: "Увесь рік",
    });

    let displayOptions = ["Таблиця", "Стовпчаста діаграма", "Кругова діаграма"].map(
      (displayOption) => {
        return {
          value: displayOption,
          label: displayOption,
        };
      }
    );

    let data = {
      freq: Array(this.props.colorSchemes.length).fill(0),
      colorSchemes: this.props.colorSchemes
    };

    let monthIndex = FULL_MONTH_NAMES.indexOf(this.state.monthOption);
    let begin = 0, end = this.props.values.length;
    if (monthIndex !== -1) {
      begin = monthIndex * 31;
      end = begin + DAYS_PER_MONTH[monthIndex];
    }

    let numFilled = 0;
    let numTotal = 0;
    for (let i = begin; i < end; i++) {
      if (this.props.values[i] !== 0) {
        numFilled++;
        data.freq[this.props.values[i] - 1]++;
      }

      numTotal++;
    }

    numTotal = Math.min(numTotal, 365);
    if (monthIndex === 1 || monthIndex === -1) {
      if (isLeapYear(this.props.year)) {
        numTotal++;
      }
    }

    let display = null;
    switch (this.state.displayOption) {
      case "Стовпчаста діаграма":
        display = <CountBarGraph data={data} />;
        break;
      case "Кругова діаграма":
        display = <CountPieChart data={data} />;
        break;
      case "Таблиця":
      default:
        display = <CountTable data={data} />;
        break;
    }

    return (
      <Container>
        <Row className="d-flex mb-3">
          <Select
            value={{
              value: this.state.monthOption,
              label: this.state.monthOption,
            }}
            options={monthOptions}
            styles={selectStyles}
            onChange={this.onChangeMonth}
            className="mx-auto flex-grow-1"
            style={{ maxWidth: "250px" }}
          />
          <Select
            value={{
              value: this.state.displayOption,
              label: this.state.displayOption,
            }}
            options={displayOptions}
            styles={selectStyles}
            onChange={this.onChangeDisplay}
            className="mx-auto flex-grow-1"
            style={{ maxWidth: "250px" }}
          />
        </Row>
        <Row>{display}</Row>
        <Row>
          <p className="text-secondary">
            Заповнено днів: {numFilled}/{numTotal}
          </p>
        </Row>
      </Container>
    );
  }
}
